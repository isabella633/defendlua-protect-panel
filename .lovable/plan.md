# Block loadstring hooking attacks

## The attack

Attacker replaces `loadstring` with a Lua wrapper that `print`s the source before calling the real one. When your protected script runs via `loadstring(game:HttpGet(...))()`, the wrapper sees the entire decrypted payload as plain text.

## Options

**A. Hook detection (recommended — small, ships now).** Inject a check at the very top of every protected payload. If `loadstring` / `HttpGet` / `HttpService` are not clean C closures, kick the player. Stops this exact attack and 95% of copy-paste variants.

**B. Custom VM (what the other AI suggested).** Compile Lua to custom opcodes, ship an interpreter. Weeks of work, ~5–20x runtime cost, breaks Roblox API ergonomics, and is still ultimately bypassable by hooking the interpreter's dispatch. Not worth it as a first step.

I recommend A now, revisit B only if attackers adapt.

## What I'll build (Option A)

Add a hardened preamble to the obfuscator output in `supabase/functions/serve-raw-script/index.ts` (and the loader payload) that runs before any decryption:

1. **C-closure check** — `iscclosure(loadstring)`, `iscclosure(game.HttpGet)`, `iscclosure(game.GetService)`. Any `false` = hooked.
2. **Source check** — `debug.info(loadstring, "s") == "[C]"`. Lua wrappers return a script path instead.
3. **Identity capture at load time** — cache references to `loadstring`, `game.HttpGet`, `Instance.new` in locals before the payload runs, then the payload uses only those locals. A hook installed *after* our stub loads can't intercept.
4. **Self-rehost** — the outer `loadstring(HttpGet(...))()` call is unavoidable (that's how loaders work), but the inner decrypted body will re-fetch its real payload through the cached HttpGet, so a hook installed between stages sees only the tiny stub, not the actual script.
5. **Kick on tamper** — uses existing kick path (`Players:Kick` with reason `Environment tampering detected`).

Executor coverage: `iscclosure` / `debug.info` exist in Solara, Wave, Swift, Xeno, Synapse, Krnl. On executors missing `iscclosure`, we fall back to the `debug.info` check alone.

## Files

- `supabase/functions/serve-raw-script/index.ts` — add anti-hook preamble to the emitted Lua.
- `supabase/functions/discord-interactions/index.ts` — same preamble on the loader's "Get Script" direct payload.
- No DB or UI changes.

## Not in scope

- Full custom VM (Option B).
- Bytecode via `string.dump` (per project memory, avoided for compatibility).
- `hookfunction`-based self-defense (per project memory, avoided).

Approve and I'll implement.
