// Fengari-backed test harness: run original and protected Lua in the same
// sandbox, capture returned values + printed output, deep-equal the result.
// Used by vitest and by any pre-flight validation on save.
import { protect } from "./index";
// @ts-ignore - fengari has no bundled types
import * as fengari from "fengari";

const { lua, lauxlib, lualib, to_luastring } = fengari;

interface Run {
  returns: any[];
  output: string[];
  error: string | null;
}

function runLua(source: string): Run {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  const output: string[] = [];

  // Override print to capture output.
  lua.lua_pushjsfunction(L, (LL: any) => {
    const n = lua.lua_gettop(LL);
    const parts: string[] = [];
    for (let i = 1; i <= n; i++) {
      const s = lauxlib.luaL_tolstring(LL, i);
      parts.push(fengari.to_jsstring(s));
      lua.lua_pop(LL, 1);
    }
    output.push(parts.join("\t"));
    return 0;
  });
  lua.lua_setglobal(L, to_luastring("print"));

  const loaded = lauxlib.luaL_loadstring(L, to_luastring(source));
  if (loaded !== lua.LUA_OK) {
    const err = fengari.to_jsstring(lua.lua_tostring(L, -1));
    return { returns: [], output, error: err };
  }
  const before = lua.lua_gettop(L);
  const status = lua.lua_pcall(L, 0, lua.LUA_MULTRET, 0);
  if (status !== lua.LUA_OK) {
    const err = fengari.to_jsstring(lua.lua_tostring(L, -1));
    return { returns: [], output, error: err };
  }
  const after = lua.lua_gettop(L);
  const nRet = after - (before - 1);
  const returns: any[] = [];
  for (let i = 1; i <= nRet; i++) {
    returns.push(luaValueToJs(L, before + i - 1));
  }
  lua.lua_settop(L, 0);
  return { returns, output, error: null };
}

function luaValueToJs(L: any, idx: number): any {
  const t = lua.lua_type(L, idx);
  if (t === lua.LUA_TNIL) return null;
  if (t === lua.LUA_TBOOLEAN) return lua.lua_toboolean(L, idx);
  if (t === lua.LUA_TNUMBER) return lua.lua_tonumber(L, idx);
  if (t === lua.LUA_TSTRING) return fengari.to_jsstring(lua.lua_tostring(L, idx));
  if (t === lua.LUA_TTABLE) {
    // Convert to a plain object with numeric+string keys.
    const obj: any = {};
    lua.lua_pushnil(L);
    while (lua.lua_next(L, idx) !== 0) {
      const kt = lua.lua_type(L, -2);
      let key: any;
      if (kt === lua.LUA_TNUMBER) key = lua.lua_tonumber(L, -2);
      else if (kt === lua.LUA_TSTRING) key = fengari.to_jsstring(lua.lua_tostring(L, -2));
      else key = `<${kt}>`;
      obj[key] = luaValueToJs(L, lua.lua_gettop(L));
      lua.lua_pop(L, 1);
    }
    return obj;
  }
  return `<lua:${t}>`;
}

export interface VerifyResult {
  ok: boolean;
  reason?: string;
  original?: Run;
  protectedRun?: Run;
  protectedSource?: string;
}

export function verify(source: string): VerifyResult {
  const orig = runLua(source);
  const p = protect(source);
  if (!p.ok) return { ok: false, reason: `protect failed: ${p.reason}`, original: orig };
  const prot = runLua(p.code);

  const same =
    JSON.stringify(orig.returns) === JSON.stringify(prot.returns) &&
    JSON.stringify(orig.output) === JSON.stringify(prot.output) &&
    (orig.error === null) === (prot.error === null);

  if (!same) {
    return {
      ok: false,
      reason: `behavior mismatch\n  orig.returns=${JSON.stringify(orig.returns)}\n  prot.returns=${JSON.stringify(prot.returns)}\n  orig.output=${JSON.stringify(orig.output)}\n  prot.output=${JSON.stringify(prot.output)}\n  orig.error=${orig.error}\n  prot.error=${prot.error}`,
      original: orig,
      protectedRun: prot,
      protectedSource: p.code,
    };
  }
  return { ok: true, original: orig, protectedRun: prot, protectedSource: p.code };
}
