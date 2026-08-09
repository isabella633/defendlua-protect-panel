import * as luaparse from "luaparse";

export type LuaAst = luaparse.Chunk;

export function parse(source: string): LuaAst {
  return luaparse.parse(source, {
    luaVersion: "5.1",
    locations: true,
    ranges: false,
    comments: false,
    scope: false,
  }) as LuaAst;
}
