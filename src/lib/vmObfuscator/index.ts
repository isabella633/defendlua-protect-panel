import { parse } from "./parser";
import { validate, type Unsupported } from "./validator";
import { compile, type Proto } from "./compiler";
import { toLuaLiteral } from "./luaSerialize";
import { INTERPRETER_TEMPLATE } from "./interpreterTemplate";

export type ProtectMode = "safe" | "balanced";

export interface ProtectOK {
  ok: true;
  code: string;
  proto: Proto;
}
export interface ProtectFail {
  ok: false;
  reason: string;
  issues?: Unsupported[];
}
export type ProtectResult = ProtectOK | ProtectFail;

export function protect(source: string, _mode: ProtectMode = "safe"): ProtectResult {
  let ast;
  try {
    ast = parse(source);
  } catch (e: any) {
    return { ok: false, reason: `parse error: ${e.message || String(e)}` };
  }
  const issues = validate(ast);
  if (issues.length > 0) {
    const first = issues[0];
    return {
      ok: false,
      reason: `unsupported syntax: ${first.detail} at line ${first.line}`,
      issues,
    };
  }
  let proto: Proto;
  try {
    proto = compile(ast);
  } catch (e: any) {
    return { ok: false, reason: `compile error: ${e.message || String(e)}` };
  }
  const serialized = serializeProto(proto);
  const code =
    `-- DefendLua VM protected build\n` +
    INTERPRETER_TEMPLATE +
    `\nreturn __dl_vm(${toLuaLiteral(serialized)}, { n = select("#", ...), ... })\n`;
  return { ok: true, code, proto };
}

// Convert Proto (which contains arrays like `code`, `protos`, `upvals`, plus
// scalar fields) to a JS-serializable object that matches what the interpreter
// reads: proto.code[i], proto.protos[i], proto.upvals[i], proto.paramSlots[i],
// proto.numParams, proto.isVararg.
function serializeProto(p: Proto): any {
  return {
    code: p.code,
    protos: p.protos.map(serializeProto),
    upvals: p.upvals.map((u) => ({ kind: u.kind, index: u.index, name: u.name })),
    paramSlots: p.paramSlots,
    numParams: p.numParams,
    isVararg: p.isVararg,
  };
}

export { INTERPRETER_TEMPLATE };
