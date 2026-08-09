# Custom Lua VM Obfuscator — Phase 1–3

Build a compiler-style VM obfuscator that turns Lua 5.1 source into custom bytecode + a generated Lua interpreter. Correctness first. Reliability comes from an automated test harness that refuses to emit protected output when behavior diverges from the original.

Coexists with the current XOR pipeline as an **opt-in mode** (`vm_protection_mode`), default OFF. Existing scripts keep working.

---

## Deliverables (this pass)

1. **TS compiler library** at `src/lib/vmObfuscator/` — parser → IR → VM bytecode → generated Lua interpreter.
2. **Automated test harness** — runs original and protected Lua side-by-side via **Fengari** (bundled Lua 5.1 in JS) and diffs results. Build fails on mismatch.
3. **Vitest suite** covering Phase 1–3 features and the demo program from the request.
4. **Edge function integration** — `serve-raw-script` optionally wraps user code with the VM when the script has `vm_protection_mode = 'balanced'`. SAFE default; unsupported syntax → falls back to current pipeline with a clear log.
5. **DB column** `scripts.vm_protection_mode` (`'off' | 'safe' | 'balanced'`), default `'off'`.
6. **Owner Panel toggle** to pick the mode per script.
7. **Disassembler / debug dumper** exposed as a dev-only function.

Phases 4–7 (Luau specifics, packed bytecode, per-build randomization, control-flow flattening) are **out of scope** for this pass — will be added in follow-ups once Phase 1–3 is green.

---

## Architecture

```text
Lua source
   ↓  luaparse (Lua 5.1 AST)
AST
   ↓  IR builder (SSA-ish, register-allocated)
IR (typed instruction list + constant pool + proto tree)
   ↓  compatibility validator (whitelist of supported node kinds)
   ↓  VM compiler (IR → opcodes)
Bytecode module (JSON-ish tables)
   ↓  Lua emitter (serializes bytecode + inlines the interpreter template)
Protected Lua script
   ↓  test harness (Fengari runs original + protected, diffs results)
   ↓  emit only if diff is empty
```

---

## Instruction set (Phase 1–3, ~20 ops)

Register-based, 3-address, similar spirit to Lua's own but **not** the same encoding.

```
LOADK    A, Kx           R[A] = K[Kx]
LOADBOOL A, B, C         R[A] = (B~=0); if C~=0 then pc++
LOADNIL  A, B            R[A..B] = nil
MOVE     A, B            R[A] = R[B]
GETGLOBAL A, Kx          R[A] = _ENV[K[Kx]]
SETGLOBAL A, Kx          _ENV[K[Kx]] = R[A]
GETUPVAL A, B            R[A] = U[B]
SETUPVAL A, B            U[B] = R[A]
GETTABLE A, B, C         R[A] = R[B][RK(C)]
SETTABLE A, B, C         R[A][RK(B)] = RK(C)
NEWTABLE A               R[A] = {}
ADD/SUB/MUL/DIV/MOD/POW  A, B, C   arithmetic on RK
UNM/NOT/LEN              A, B
CONCAT   A, B, C         R[A] = R[B] .. ... .. R[C]
EQ/LT/LE A, B, C         if (RK(B) op RK(C)) ~= A then pc++
TEST     A, C            if (not R[A]) == C then pc++
JMP      sBx             pc += sBx
CALL     A, B, C         R[A..A+C-2] = R[A](R[A+1..A+B-1])   (B=0 varargs, C=0 multret)
RETURN   A, B            return R[A..A+B-2]  (B=0 up to top)
CLOSURE  A, Bx           R[A] = closure(protos[Bx])   (followed by MOVE/GETUPVAL pseudo-ops for upvalue binding)
VARARG   A, B            R[A..] = varargs
FORPREP  A, sBx          numeric for setup
FORLOOP  A, sBx          numeric for step
TFORCALL A, C            generic for iterator call
TFORLOOP A, sBx          generic for loop
SELF     A, B, C         R[A+1]=R[B]; R[A]=R[B][RK(C)]   (for method calls)
```

RK encoding: high bit set means constant index, otherwise register.

Constant pool stores nil / bool / number / string only. Function prototypes are stored in a proto tree (parent proto knows child protos, referenced by CLOSURE's Bx).

---

## Runtime layout of generated script

```lua
-- Header: kick guard (reused from existing pipeline) + watermark
local K = { <consts> }
local P = { <proto tree serialized as nested tables of {code, consts, protos, numparams, is_vararg, upvaldesc}> }
local function VM(proto, args, upvals)
  local R, pc, top = {}, 1, 0
  local code = proto.code
  while true do
    local ins = code[pc]; pc = pc + 1
    local op = ins[1]
    if op == 1 then      -- LOADK
      R[ins[2]] = proto.consts[ins[3]]
    elseif op == 2 then  -- MOVE
      ...
    -- ...
    elseif op == OP_RETURN then
      local a, b = ins[2], ins[3]
      if b == 0 then return unpack(R, a, top)
      else return unpack(R, a, a + b - 2) end
    end
  end
end
return VM(P[1], {...}, {})
```

Readable dispatcher this pass — packed encoding is Phase 5.

---

## Compatibility validator (SAFE)

Walk the AST; **reject** anything not in this allowlist:

- LocalStatement, AssignmentStatement (single or multi-target on locals/globals/index expressions)
- IfStatement, WhileStatement, RepeatStatement, NumericForStatement, GenericForStatement, DoStatement
- ReturnStatement, BreakStatement
- FunctionDeclaration (local + global + method sugar), FunctionExpression
- CallStatement / CallExpression, TableCallExpression, StringCallExpression
- Identifier, NumericLiteral, StringLiteral, BooleanLiteral, NilLiteral, VarargLiteral
- BinaryExpression, LogicalExpression, UnaryExpression, IndexExpression, MemberExpression, TableConstructorExpression

**Reject with clear error** (and fall back to current XOR pipeline): goto/labels, Luau-specific syntax (type annotations, `continue`, `+=`, string interpolation, `if..then..else` expressions), bitwise ops, integer/float distinction, `_ENV` reassignment inside closures.

When SAFE rejects, the pipeline **does not silently ship broken code** — it either returns an error to the Owner Panel ("script uses unsupported syntax: <detail> at line N") or falls back to XOR-only, based on the mode:

- `off` — current pipeline, unchanged.
- `safe` — try VM; on any rejection or test failure, error out (no fallback). Guarantees VM-protected or nothing.
- `balanced` — try VM; on rejection, fall back to XOR pipeline and log why.

---

## Test harness

`src/lib/vmObfuscator/testHarness.ts`:

```ts
async function verify(source: string): Promise<{ok: true} | {ok: false, reason: string}>
```

Steps:
1. Fengari: load original, capture `{returns, printOutput, error}` from a controlled sandbox (custom `print`, deterministic globals).
2. Compile → emit protected Lua.
3. Fengari: load protected under same sandbox.
4. Deep-equal results. Any mismatch → `{ok: false}` with a diff.

Vitest cases (each runs `verify` and asserts `ok`):
- arithmetic + precedence
- locals + globals
- if/elseif/else
- while, repeat-until, numeric for (with step), generic for using `pairs`/`ipairs`
- tables: array + hash + mixed constructors, nested indexing
- string concat, length, comparison
- multiple assignment + multiple return
- nested functions, upvalues, recursive local function
- varargs `...` and `select`
- method call sugar (`t:m(x)`)
- the demo program from the request → expect stdout `30`

Harness is also invoked from the edge function integration path (server-side, before serving) using a Deno-compatible Fengari build. If server-side verification is not feasible in the edge runtime this pass, the server trusts the client-side pre-verified bytecode — bytecode integrity is signed with `SCRIPT_FETCH_SECRET` so it can't be swapped.

---

## File layout

```
src/lib/vmObfuscator/
  index.ts               // public API: protect(source, opts) → {ok, protected} | {ok:false, reason}
  parser.ts              // wraps luaparse, normalizes AST
  ir.ts                  // IR types + builder from AST
  registerAlloc.ts       // simple linear scan
  compiler.ts            // IR → opcodes + proto tree
  opcodes.ts             // opcode constants + metadata
  emitter.ts             // proto tree → Lua source (constants + interpreter template)
  interpreterTemplate.lua.ts  // string template for VM
  validator.ts           // SAFE feature allowlist
  disassembler.ts        // debug dump
  testHarness.ts         // Fengari-based diff runner
  __tests__/*.test.ts
```

New dependencies: `luaparse` (Lua 5.1 AST), `fengari` (embedded Lua 5.1 VM).

---

## DB + integration

Migration:

```sql
ALTER TABLE public.scripts
  ADD COLUMN IF NOT EXISTS vm_protection_mode text NOT NULL DEFAULT 'off'
    CHECK (vm_protection_mode IN ('off','safe','balanced'));
```

`ScriptProtector` / Owner Panel: three-way toggle "VM protection: Off / Safe / Balanced" with tooltip explaining the trade-off.

`serve-raw-script`:
- If `vm_protection_mode != 'off'`, compile with VM library (or the pre-compiled protected source stored alongside the script — TBD; simplest is compile-on-save so serve stays fast).
- Wrap the resulting VM script with the existing anti-tamper preamble, watermark, and HWID gate.
- If VM compilation errored during save, `vm_protection_mode` is reset to `off` and the user is shown the reason — the DB never stores a broken VM build.

---

## Explicit non-goals this pass

- No packed bytecode / opcode randomization (Phase 5–6).
- No control-flow flattening / handler permutation (Phase 7).
- No Luau-specific syntax (`type`, `continue`, `+=`, etc.) — rejected by validator.
- No coroutine virtualization — `coroutine.*` calls still work (they're regular function calls); we do not virtualize `yield` across the VM boundary. Scripts that yield inside virtualized functions are rejected.
- No metatable virtualization — metatables on user tables still work at the Lua level; we just don't add new metamethod hooks in the VM.

---

## Acceptance

- `bun run test src/lib/vmObfuscator` — all Phase 1–3 vitest cases pass.
- The demo program from the request compiles, executes under Fengari, and prints `30`.
- `protect()` on an unsupported script returns `{ok: false, reason}` with the offending node kind + line.
- Owner Panel can switch a script between Off/Safe/Balanced without breaking existing execution.
