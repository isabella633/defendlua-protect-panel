// Compiler: Lua AST -> Proto tree of virtualized instructions.
// Each Proto = { code: Stmt[], numParams, isVararg, upvals: UpvalDesc[], protos: Proto[] }
// Each Stmt / Expr is a small tagged array/tuple (opcode + operands) matching src/lib/vmObfuscator/opcodes.ts.
import { OP } from "./opcodes";
import type { LuaAst } from "./parser";

export interface UpvalDesc {
  kind: "local" | "upval";
  index: number;
  name: string;
}
export interface Proto {
  code: any[];
  numParams: number;
  isVararg: boolean;
  upvals: UpvalDesc[];
  protos: Proto[];
  paramSlots: number[];
}

interface LocalVar {
  name: string;
  slot: number;
}
interface FuncScope {
  parent: FuncScope | null;
  locals: LocalVar[]; // stack; scope pop truncates
  scopeStack: number[]; // saved locals.length at each block entry
  nextSlot: number;
  upvals: UpvalDesc[];
  protos: Proto[];
  isVararg: boolean;
  numParams: number;
  paramSlots: number[];
}

function newScope(parent: FuncScope | null, isVararg: boolean): FuncScope {
  return {
    parent,
    locals: [],
    scopeStack: [],
    nextSlot: 0,
    upvals: [],
    protos: [],
    isVararg,
    numParams: 0,
    paramSlots: [],
  };
}

function pushBlock(s: FuncScope) {
  s.scopeStack.push(s.locals.length);
}
function popBlock(s: FuncScope) {
  const top = s.scopeStack.pop()!;
  s.locals.length = top;
}
function declareLocal(s: FuncScope, name: string): number {
  const slot = s.nextSlot++;
  s.locals.push({ name, slot });
  return slot;
}

// Resolve identifier: local slot, upvalue index, or global.
type Resolved =
  | { kind: "local"; slot: number }
  | { kind: "upval"; index: number }
  | { kind: "global" };

function resolve(s: FuncScope, name: string): Resolved {
  // local
  for (let i = s.locals.length - 1; i >= 0; i--) {
    if (s.locals[i].name === name) return { kind: "local", slot: s.locals[i].slot };
  }
  // existing upval
  const existing = s.upvals.findIndex((u) => u.name === name);
  if (existing >= 0) return { kind: "upval", index: existing };
  // walk parent
  if (s.parent) {
    const parentRes = resolve(s.parent, name);
    if (parentRes.kind === "local") {
      s.upvals.push({ kind: "local", index: parentRes.slot, name });
      return { kind: "upval", index: s.upvals.length - 1 };
    }
    if (parentRes.kind === "upval") {
      s.upvals.push({ kind: "upval", index: parentRes.index, name });
      return { kind: "upval", index: s.upvals.length - 1 };
    }
  }
  return { kind: "global" };
}

function compileExpr(scope: FuncScope, node: any): any[] {
  switch (node.type) {
    case "NilLiteral": return [OP.NIL];
    case "BooleanLiteral": return [node.value ? OP.TRUE : OP.FALSE];
    case "NumericLiteral": return [OP.NUMBER, node.value];
    case "StringLiteral": return [OP.STRING, node.value];
    case "VarargLiteral":
      if (!scope.isVararg) throw new Error("... used in non-vararg function");
      return [OP.VARARG];
    case "Identifier": {
      const r = resolve(scope, node.name);
      if (r.kind === "local") return [OP.LOCAL, r.slot];
      if (r.kind === "upval") return [OP.UPVAL, r.index];
      return [OP.GLOBAL, node.name];
    }
    case "IndexExpression":
      return [OP.INDEX, compileExpr(scope, node.base), compileExpr(scope, node.index)];
    case "MemberExpression":
      // t.k  or  t:k (indexer is '.' or ':'); handled by caller for ':' method calls
      return [OP.INDEX, compileExpr(scope, node.base), [OP.STRING, node.identifier.name]];
    case "BinaryExpression":
      return [OP.BINOP, node.operator, compileExpr(scope, node.left), compileExpr(scope, node.right)];
    case "LogicalExpression":
      return [OP.LOGICAL, node.operator, compileExpr(scope, node.left), compileExpr(scope, node.right)];
    case "UnaryExpression":
      return [OP.UNOP, node.operator, compileExpr(scope, node.argument)];
    case "CallExpression":
    case "StringCallExpression":
    case "TableCallExpression":
      return compileCall(scope, node, true /*wantMulti*/);
    case "TableConstructorExpression": {
      const fields = node.fields.map((f: any) => {
        if (f.type === "TableValue") return { k: "array", v: compileExpr(scope, f.value) };
        if (f.type === "TableKeyString") return { k: "named", name: f.key.name, v: compileExpr(scope, f.value) };
        if (f.type === "TableKey") return { k: "keyed", key: compileExpr(scope, f.key), v: compileExpr(scope, f.value) };
        throw new Error(`unsupported table field: ${f.type}`);
      });
      return [OP.TABLE, fields];
    }
    case "FunctionDeclaration": {
      // anonymous function expression (identifier === null)
      const protoIdx = compileFunctionProto(scope, node);
      return [OP.CLOSURE, protoIdx];
    }
    default:
      throw new Error(`unsupported expression: ${node.type}`);
  }
}

function compileCall(scope: FuncScope, node: any, wantMulti: boolean): any[] {
  // Handle method-call (base:name(args)) via MemberExpression w/ indexer ':'
  const args =
    node.type === "CallExpression" ? node.arguments :
    node.type === "StringCallExpression" ? [node.argument] :
    /* TableCallExpression */ [node.argument];

  if (node.base?.type === "MemberExpression" && node.base.indexer === ":") {
    return [
      OP.METHODCALL,
      compileExpr(scope, node.base.base),
      node.base.identifier.name,
      args.map((a: any) => compileExpr(scope, a)),
      wantMulti,
    ];
  }
  return [
    OP.CALL,
    compileExpr(scope, node.base),
    args.map((a: any) => compileExpr(scope, a)),
    wantMulti,
  ];
}

function compileFunctionProto(scope: FuncScope, node: any): number {
  const child = newScope(scope, !!node.isVararg || node.parameters.some((p: any) => p.type === "VarargLiteral"));
  // parameters
  for (const p of node.parameters) {
    if (p.type === "Identifier") {
      const slot = declareLocal(child, p.name);
      child.paramSlots.push(slot);
      child.numParams++;
    } else if (p.type === "VarargLiteral") {
      child.isVararg = true;
    }
  }
  const body = compileBlock(child, node.body);
  const proto: Proto = {
    code: body,
    numParams: child.numParams,
    isVararg: child.isVararg,
    upvals: child.upvals,
    protos: child.protos,
    paramSlots: child.paramSlots,
  };
  scope.protos.push(proto);
  return scope.protos.length - 1;
}

function compileBlock(scope: FuncScope, statements: any[]): any[] {
  pushBlock(scope);
  const out: any[] = [];
  for (const s of statements) out.push(compileStmt(scope, s));
  popBlock(scope);
  return out;
}

function compileStmt(scope: FuncScope, node: any): any[] {
  switch (node.type) {
    case "LocalStatement": {
      // Compile RHS first *in the outer scope* (before locals bind), then declare locals.
      const exprs = node.init.map((e: any) => compileExpr(scope, e));
      const slots = node.variables.map((v: any) => declareLocal(scope, v.name));
      return [OP.LOCALASSIGN, slots, exprs];
    }
    case "AssignmentStatement": {
      const targets = node.variables.map((v: any) => {
        if (v.type === "Identifier") {
          const r = resolve(scope, v.name);
          if (r.kind === "local") return { t: "local", slot: r.slot };
          if (r.kind === "upval") return { t: "upval", index: r.index };
          return { t: "global", name: v.name };
        }
        if (v.type === "IndexExpression") {
          return { t: "index", obj: compileExpr(scope, v.base), key: compileExpr(scope, v.index) };
        }
        if (v.type === "MemberExpression") {
          return { t: "index", obj: compileExpr(scope, v.base), key: [OP.STRING, v.identifier.name] };
        }
        throw new Error(`unsupported assign target: ${v.type}`);
      });
      const exprs = node.init.map((e: any) => compileExpr(scope, e));
      return [OP.ASSIGN, targets, exprs];
    }
    case "IfStatement": {
      const clauses: any[] = [];
      let elseBlock: any[] | null = null;
      for (const c of node.clauses) {
        if (c.type === "IfClause" || c.type === "ElseifClause") {
          clauses.push({ cond: compileExpr(scope, c.condition), block: compileBlock(scope, c.body) });
        } else if (c.type === "ElseClause") {
          elseBlock = compileBlock(scope, c.body);
        }
      }
      return [OP.IF, clauses, elseBlock];
    }
    case "WhileStatement":
      return [OP.WHILE, compileExpr(scope, node.condition), compileBlock(scope, node.body)];
    case "RepeatStatement": {
      // `until` sees locals declared inside the block. We compile the block, then
      // the condition using the same scope frame (block popped by compileBlock).
      // To match Lua semantics we build the block manually here.
      pushBlock(scope);
      const body = node.body.map((s: any) => compileStmt(scope, s));
      const cond = compileExpr(scope, node.condition);
      popBlock(scope);
      return [OP.REPEAT, body, cond];
    }
    case "ForNumericStatement": {
      pushBlock(scope);
      const slot = declareLocal(scope, node.variable.name);
      const start = compileExpr(scope, node.start);
      const stop = compileExpr(scope, node.end);
      const step = node.step ? compileExpr(scope, node.step) : null;
      const body = node.body.map((s: any) => compileStmt(scope, s));
      popBlock(scope);
      return [OP.NFOR, slot, start, stop, step, body];
    }
    case "ForGenericStatement": {
      // exprs compiled in outer scope
      const exprs = node.iterators.map((e: any) => compileExpr(scope, e));
      pushBlock(scope);
      const slots = node.variables.map((v: any) => declareLocal(scope, v.name));
      const body = node.body.map((s: any) => compileStmt(scope, s));
      popBlock(scope);
      return [OP.GFOR, slots, exprs, body];
    }
    case "DoStatement":
      return [OP.DO, compileBlock(scope, node.body)];
    case "ReturnStatement":
      return [OP.RETURN, node.arguments.map((a: any) => compileExpr(scope, a))];
    case "BreakStatement":
      return [OP.BREAK];
    case "CallStatement":
      return [OP.CALLSTMT, compileCall(scope, node.expression, false)];
    case "FunctionDeclaration": {
      // Three forms:
      //  local function f() ... end  (isLocal + Identifier name)
      //  function f() ... end        (global Identifier)
      //  function a.b.c:m() ... end  (MemberExpression chain, optional method)
      if (node.isLocal) {
        // Declare local *before* compiling body so recursion works.
        const slot = declareLocal(scope, node.identifier.name);
        const protoIdx = compileFunctionProto(scope, node);
        return [OP.LOCALASSIGN, [slot], [[OP.CLOSURE, protoIdx]]];
      }
      // Global-ish declaration
      if (node.identifier.type === "Identifier") {
        const protoIdx = compileFunctionProto(scope, node);
        const target = { t: "global", name: node.identifier.name };
        return [OP.ASSIGN, [target], [[OP.CLOSURE, protoIdx]]];
      }
      // MemberExpression chain: a.b.c:m -> add implicit 'self' param
      if (node.identifier.type === "MemberExpression") {
        const isMethod = node.identifier.indexer === ":";
        if (isMethod) {
          // Inject 'self' as first param
          node.parameters = [{ type: "Identifier", name: "self" }, ...node.parameters];
        }
        const protoIdx = compileFunctionProto(scope, node);
        // Build assignment target from member chain
        const target = {
          t: "index",
          obj: compileExpr(scope, node.identifier.base),
          key: [OP.STRING, node.identifier.identifier.name],
        };
        return [OP.ASSIGN, [target], [[OP.CLOSURE, protoIdx]]];
      }
      throw new Error("unsupported function declaration form");
    }
    default:
      throw new Error(`unsupported statement: ${node.type}`);
  }
}

export function compile(ast: LuaAst): Proto {
  const top = newScope(null, true);
  const body = compileBlock(top, ast.body);
  return {
    code: body,
    numParams: 0,
    isVararg: true,
    upvals: top.upvals,
    protos: top.protos,
    paramSlots: [],
  };
}
