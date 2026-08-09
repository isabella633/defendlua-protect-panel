import type { LuaAst } from "./parser";

// SAFE mode: reject anything we don't reliably virtualize. Return a list of
// unsupported nodes with source line information. Empty list = compatible.
export interface Unsupported {
  line: number;
  kind: string;
  detail: string;
}

const SUPPORTED_NODE_TYPES = new Set([
  "Chunk",
  "LocalStatement",
  "AssignmentStatement",
  "IfStatement",
  "IfClause",
  "ElseifClause",
  "ElseClause",
  "WhileStatement",
  "RepeatStatement",
  "ForNumericStatement",
  "ForGenericStatement",
  "DoStatement",
  "ReturnStatement",
  "BreakStatement",
  "FunctionDeclaration",
  "CallStatement",
  "CallExpression",
  "TableCallExpression",
  "StringCallExpression",
  "Identifier",
  "NumericLiteral",
  "StringLiteral",
  "BooleanLiteral",
  "NilLiteral",
  "VarargLiteral",
  "BinaryExpression",
  "LogicalExpression",
  "UnaryExpression",
  "IndexExpression",
  "MemberExpression",
  "TableConstructorExpression",
  "TableKey",
  "TableKeyString",
  "TableValue",
]);

// Binary/unary operators we support (Lua 5.1 core).
const SUPPORTED_BINOPS = new Set([
  "+", "-", "*", "/", "%", "^", "..",
  "==", "~=", "<", ">", "<=", ">=",
]);
const SUPPORTED_LOGOPS = new Set(["and", "or"]);
const SUPPORTED_UNOPS = new Set(["-", "not", "#"]);

export function validate(ast: LuaAst): Unsupported[] {
  const issues: Unsupported[] = [];
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const c of node) walk(c);
      return;
    }
    if (typeof node.type === "string") {
      if (!SUPPORTED_NODE_TYPES.has(node.type)) {
        issues.push({
          line: node.loc?.start?.line ?? 0,
          kind: node.type,
          detail: `${node.type} is not supported in SAFE VM mode`,
        });
        return;
      }
      if (node.type === "BinaryExpression" && !SUPPORTED_BINOPS.has(node.operator)) {
        issues.push({ line: node.loc?.start?.line ?? 0, kind: "BinaryOp", detail: `binary operator '${node.operator}' not supported` });
      }
      if (node.type === "LogicalExpression" && !SUPPORTED_LOGOPS.has(node.operator)) {
        issues.push({ line: node.loc?.start?.line ?? 0, kind: "LogicalOp", detail: `logical operator '${node.operator}' not supported` });
      }
      if (node.type === "UnaryExpression" && !SUPPORTED_UNOPS.has(node.operator)) {
        issues.push({ line: node.loc?.start?.line ?? 0, kind: "UnaryOp", detail: `unary operator '${node.operator}' not supported` });
      }
    }
    for (const k of Object.keys(node)) {
      if (k === "loc" || k === "range" || k === "type") continue;
      walk((node as any)[k]);
    }
  };
  walk(ast);
  return issues;
}
