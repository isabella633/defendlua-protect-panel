// Opcode constants for the DefendLua VM.
// Statements and expressions share one numeric namespace so the interpreter
// dispatches on a single integer field per node.
export const OP = {
  // Expressions
  NIL: 1,
  TRUE: 2,
  FALSE: 3,
  NUMBER: 4,
  STRING: 5,
  VARARG: 6,
  LOCAL: 7,        // [op, slot]
  UPVAL: 8,        // [op, upvalIndex]
  GLOBAL: 9,       // [op, nameConstIndex]
  INDEX: 10,       // [op, objExpr, keyExpr]
  BINOP: 11,       // [op, opStr, lhs, rhs]
  UNOP: 12,        // [op, opStr, operand]
  LOGICAL: 13,     // [op, "and"|"or", lhs, rhs]
  CALL: 14,        // [op, calleeExpr, argsExprList, wantMulti]
  METHODCALL: 15,  // [op, objExpr, methodConstIndex, argsExprList, wantMulti]
  TABLE: 16,       // [op, fields[]]  where field = {kind, ...}
  CLOSURE: 17,     // [op, protoIndex]

  // Statements
  LOCALASSIGN: 30,     // [op, slots[], exprs[]]  (adjust to n)
  ASSIGN: 31,          // [op, targets[], exprs[]]  target = {kind, ...}
  IF: 32,              // [op, clauses[], elseBlock?]   clause = {cond, block}
  WHILE: 33,           // [op, cond, block]
  REPEAT: 34,          // [op, block, cond]
  NFOR: 35,            // [op, slot, start, stop, step?, block]
  GFOR: 36,            // [op, slots[], exprs[], block]
  DO: 37,              // [op, block]
  RETURN: 38,          // [op, exprs[]]
  BREAK: 39,           // [op]
  CALLSTMT: 40,        // [op, callExpr]
  FUNCDECLGLOBAL: 41,  // [op, nameChainConstIndices[], isMethod, protoIndex]
  ASSIGNFUNC: 42,      // reserved
};

export const opName = (n: number): string =>
  (Object.entries(OP).find(([, v]) => v === n)?.[0]) ?? `OP_${n}`;
