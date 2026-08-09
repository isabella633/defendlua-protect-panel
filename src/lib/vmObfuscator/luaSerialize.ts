// Serialize a JS value (numbers, strings, booleans, null, arrays, plain objects)
// into a Lua 5.1 literal that reconstructs an equivalent nested-table structure.
// Arrays become 1-indexed sequences. Plain objects become string-keyed tables.
export function toLuaLiteral(v: any): string {
  if (v === null || v === undefined) return "nil";
  const t = typeof v;
  if (t === "boolean") return v ? "true" : "false";
  if (t === "number") {
    if (!isFinite(v)) throw new Error("cannot serialize non-finite number");
    // Preserve integer form when safe.
    return Number.isInteger(v) ? String(v) : String(v);
  }
  if (t === "string") return luaString(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return "{}";
    return "{" + v.map(toLuaLiteral).join(",") + "}";
  }
  if (t === "object") {
    const parts: string[] = [];
    for (const k of Object.keys(v)) {
      parts.push(`[${luaString(k)}]=${toLuaLiteral(v[k])}`);
    }
    return "{" + parts.join(",") + "}";
  }
  throw new Error(`cannot serialize ${t}`);
}

function luaString(s: string): string {
  // Use long-bracket if no ']]' present and no backslashes; otherwise escape.
  const escaped = s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\0/g, "\\0");
  return `"${escaped}"`;
}
