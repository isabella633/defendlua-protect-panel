// The runtime interpreter, emitted verbatim into each protected script.
// It receives:
//   PROTO  = top-level proto tree (nested tables produced by luaSerialize)
//   ARGS   = varargs passed to the top-level chunk (usually empty)
// Design notes:
//  - Opcode numbers must match src/lib/vmObfuscator/opcodes.ts.
//  - Multi-value expansion is implemented by evalList: last expr in a call/return
//    list can spread if it is a CALL, METHODCALL, or VARARG.
//  - Upvalues use single-cell tables ({v=...}) so writes propagate.
//  - break / return propagate via sentinel return values from execBlock/execStmt.
export const INTERPRETER_TEMPLATE = `
local function __dl_vm(PROTO, ARGS)
  local unpack = unpack or table.unpack
  local select = select
  local type = type
  local error = error
  local setmetatable = setmetatable
  local ipairs = ipairs
  local pairs = pairs

  -- Sentinels
  local BRK = {} -- break signal
  local function isRet(x) return type(x) == "table" and x.__ret end

  -- Opcodes (mirror opcodes.ts)
  local NIL,TRUE,FALSE,NUMBER,STRING,VARARG = 1,2,3,4,5,6
  local LOCAL,UPVAL,GLOBAL,INDEX,BINOP,UNOP,LOGICAL = 7,8,9,10,11,12,13
  local CALL,METHODCALL,TABLE,CLOSURE = 14,15,16,17
  local LOCALASSIGN,ASSIGN,IF,WHILE,REPEAT,NFOR,GFOR,DO = 30,31,32,33,34,35,36,37
  local RETURN,BREAK,CALLSTMT,FUNCDECLGLOBAL = 38,39,40,41

  -- Binary operators as a dispatch table (avoids one giant if-chain per op).
  local BINOPS = {
    ["+"]=function(a,b) return a+b end,
    ["-"]=function(a,b) return a-b end,
    ["*"]=function(a,b) return a*b end,
    ["/"]=function(a,b) return a/b end,
    ["%"]=function(a,b) return a%b end,
    ["^"]=function(a,b) return a^b end,
    [".."]=function(a,b) return a..b end,
    ["=="]=function(a,b) return a==b end,
    ["~="]=function(a,b) return a~=b end,
    ["<"] =function(a,b) return a<b end,
    [">"] =function(a,b) return a>b end,
    ["<="]=function(a,b) return a<=b end,
    [">="]=function(a,b) return a>=b end,
  }

  local function runProto(proto, args, upvals)
    local L = {} -- locals by slot
    -- bind params
    local params = proto.paramSlots or {}
    for i=1,#params do L[params[i]] = args[i] end
    -- varargs
    local varargs
    if proto.isVararg then
      local n = #params
      varargs = { select(n+1, unpack(args, 1, args.n or #args)) }
      varargs.n = (args.n or #args) - n
      if varargs.n < 0 then varargs.n = 0 end
    end

    local evalExpr, evalList, execBlock, execStmt, evalMulti

    evalExpr = function(e)
      local op = e[1]
      if op == NIL then return nil
      elseif op == TRUE then return true
      elseif op == FALSE then return false
      elseif op == NUMBER then return e[2]
      elseif op == STRING then return e[2]
      elseif op == VARARG then return varargs[1]
      elseif op == LOCAL then return L[e[2]]
      elseif op == UPVAL then return upvals[e[2]+1].v
      elseif op == GLOBAL then return _G[e[2]]
      elseif op == INDEX then
        local o = evalExpr(e[2])
        local k = evalExpr(e[3])
        return o[k]
      elseif op == BINOP then
        return BINOPS[e[2]](evalExpr(e[3]), evalExpr(e[4]))
      elseif op == UNOP then
        local v = evalExpr(e[3])
        local o = e[2]
        if o == "-" then return -v
        elseif o == "not" then return not v
        elseif o == "#" then return #v end
      elseif op == LOGICAL then
        local l = evalExpr(e[3])
        if e[2] == "and" then
          if not l then return l end
          return evalExpr(e[4])
        else -- or
          if l then return l end
          return evalExpr(e[4])
        end
      elseif op == CALL then
        local f = evalExpr(e[2])
        local args = evalList(e[3])
        if e[4] then
          return f(unpack(args, 1, args.n))
        else
          return (f(unpack(args, 1, args.n)))
        end
      elseif op == METHODCALL then
        local self_v = evalExpr(e[2])
        local m = self_v[e[3]]
        local args = evalList(e[4])
        -- prepend self
        local n = args.n
        for i=n,1,-1 do args[i+1] = args[i] end
        args[1] = self_v
        args.n = n + 1
        if e[5] then
          return m(unpack(args, 1, args.n))
        else
          return (m(unpack(args, 1, args.n)))
        end
      elseif op == TABLE then
        local t = {}
        local ai = 1
        local fields = e[2]
        for i=1,#fields do
          local f = fields[i]
          if f.k == "array" then
            -- last array field can spread
            if i == #fields and (f.v[1] == CALL or f.v[1] == METHODCALL or f.v[1] == VARARG) then
              local vs = evalMulti(f.v)
              for j=1,vs.n do t[ai] = vs[j]; ai = ai + 1 end
            else
              t[ai] = evalExpr(f.v); ai = ai + 1
            end
          elseif f.k == "named" then
            t[f.name] = evalExpr(f.v)
          else -- keyed
            t[evalExpr(f.key)] = evalExpr(f.v)
          end
        end
        return t
      elseif op == CLOSURE then
        local childProto = proto.protos[e[2]+1]
        -- bind upvalues from this frame
        local cUp = {}
        for i=1,#childProto.upvals do
          local d = childProto.upvals[i]
          if d.kind == "local" then
            -- promote local slot to a cell if not already
            local slot = d.index
            local existing = rawget(L, "__cell_"..slot)
            if not existing then
              existing = { v = L[slot] }
              L["__cell_"..slot] = existing
              -- redirect slot access via metatable-less swap: store cell separately, keep L[slot] mirrored
              -- We keep L[slot] as the value; writes need to sync. Simpler: always read/write through cell if it exists.
            end
            cUp[i] = existing
          else -- upval
            cUp[i] = upvals[d.index+1]
          end
        end
        return function(...)
          local a = {...}
          a.n = select("#", ...)
          local r = runProto(childProto, a, cUp)
          if r == nil then return end
          return unpack(r, 1, r.n)
        end
      end
      error("bad opcode: "..tostring(op))
    end

    -- Evaluate an expression that may produce multiple values (CALL/METHODCALL/VARARG).
    evalMulti = function(e)
      local op = e[1]
      if op == CALL then
        local f = evalExpr(e[2])
        local args = evalList(e[3])
        local r = { f(unpack(args, 1, args.n)) }
        r.n = select("#", f(unpack(args, 1, args.n))) -- WRONG: would double-call
        return r
      elseif op == METHODCALL then
        local self_v = evalExpr(e[2])
        local m = self_v[e[3]]
        local args = evalList(e[4])
        local n = args.n
        for i=n,1,-1 do args[i+1] = args[i] end
        args[1] = self_v
        args.n = n + 1
        local packed = table.pack and table.pack(m(unpack(args, 1, args.n))) or (function(...) return {n=select("#",...), ...} end)(m(unpack(args, 1, args.n)))
        return packed
      elseif op == VARARG then
        local r = {}
        for i=1,varargs.n do r[i] = varargs[i] end
        r.n = varargs.n
        return r
      else
        local v = evalExpr(e)
        return { [1]=v, n=1 }
      end
    end

    -- Fix evalMulti CALL branch (avoid double call): rewrite via helper.
    local function packCall(f, args)
      local pack = table.pack or function(...) return {n=select("#",...), ...} end
      return pack(f(unpack(args, 1, args.n)))
    end
    evalMulti = function(e)
      local op = e[1]
      if op == CALL then
        local f = evalExpr(e[2])
        local args = evalList(e[3])
        return packCall(f, args)
      elseif op == METHODCALL then
        local self_v = evalExpr(e[2])
        local m = self_v[e[3]]
        local args = evalList(e[4])
        local n = args.n
        for i=n,1,-1 do args[i+1] = args[i] end
        args[1] = self_v
        args.n = n + 1
        return packCall(m, args)
      elseif op == VARARG then
        local r = {}
        for i=1,varargs.n do r[i] = varargs[i] end
        r.n = varargs.n
        return r
      else
        return { [1]=evalExpr(e), n=1 }
      end
    end

    evalList = function(exprs)
      local n = #exprs
      local out = {}
      if n == 0 then out.n = 0; return out end
      local outN = 0
      for i=1,n-1 do
        outN = outN + 1
        out[outN] = evalExpr(exprs[i])
      end
      local last = exprs[n]
      if last[1] == CALL or last[1] == METHODCALL or last[1] == VARARG then
        local vs = evalMulti(last)
        for i=1,vs.n do outN = outN + 1; out[outN] = vs[i] end
      else
        outN = outN + 1; out[outN] = evalExpr(last)
      end
      out.n = outN
      return out
    end

    -- Local read/write helpers that respect upvalue cells.
    local function getLocal(slot)
      local c = L["__cell_"..slot]
      if c then return c.v end
      return L[slot]
    end
    local function setLocal(slot, v)
      local c = L["__cell_"..slot]
      if c then c.v = v end
      L[slot] = v
    end

    -- Rewire LOCAL/UPVAL to go through the cell for correctness.
    local baseEvalExpr = evalExpr
    evalExpr = function(e)
      if e[1] == LOCAL then return getLocal(e[2]) end
      return baseEvalExpr(e)
    end

    execStmt = function(s)
      local op = s[1]
      if op == LOCALASSIGN then
        local slots, exprs = s[2], s[3]
        local vals = evalList(exprs)
        for i=1,#slots do setLocal(slots[i], vals[i]) end
        return
      elseif op == ASSIGN then
        local targets, exprs = s[2], s[3]
        local vals = evalList(exprs)
        for i=1,#targets do
          local tg = targets[i]
          local v = vals[i]
          if tg.t == "local" then setLocal(tg.slot, v)
          elseif tg.t == "upval" then upvals[tg.index+1].v = v
          elseif tg.t == "global" then _G[tg.name] = v
          elseif tg.t == "index" then
            local o = evalExpr(tg.obj)
            o[evalExpr(tg.key)] = v
          end
        end
        return
      elseif op == IF then
        for i=1,#s[2] do
          local c = s[2][i]
          if evalExpr(c.cond) then
            local r = execBlock(c.block); if r then return r end
            return
          end
        end
        if s[3] then local r = execBlock(s[3]); if r then return r end end
        return
      elseif op == WHILE then
        while evalExpr(s[2]) do
          local r = execBlock(s[3])
          if r == BRK then break end
          if isRet(r) then return r end
        end
        return
      elseif op == REPEAT then
        while true do
          local r = execBlock(s[2])
          if r == BRK then break end
          if isRet(r) then return r end
          if evalExpr(s[3]) then break end
        end
        return
      elseif op == NFOR then
        local slot, startE, stopE, stepE, body = s[2], s[3], s[4], s[5], s[6]
        local i = evalExpr(startE) + 0
        local stop = evalExpr(stopE) + 0
        local step = stepE and (evalExpr(stepE)+0) or 1
        while (step > 0 and i <= stop) or (step < 0 and i >= stop) do
          setLocal(slot, i)
          local r = execBlock(body)
          if r == BRK then break end
          if isRet(r) then return r end
          i = i + step
        end
        return
      elseif op == GFOR then
        local slots, exprs, body = s[2], s[3], s[4]
        local vals = evalList(exprs)
        local it, st, ctrl = vals[1], vals[2], vals[3]
        while true do
          local results = { it(st, ctrl) }
          ctrl = results[1]
          if ctrl == nil then break end
          for i=1,#slots do setLocal(slots[i], results[i]) end
          local r = execBlock(body)
          if r == BRK then break end
          if isRet(r) then return r end
        end
        return
      elseif op == DO then
        return execBlock(s[2])
      elseif op == RETURN then
        local vals = evalList(s[2])
        return { __ret = true, vals = vals }
      elseif op == BREAK then
        return BRK
      elseif op == CALLSTMT then
        local c = s[2]
        -- discard results
        if c[1] == CALL then
          local f = evalExpr(c[2]); local a = evalList(c[3])
          f(unpack(a, 1, a.n))
        else
          local self_v = evalExpr(c[2]); local m = self_v[c[3]]
          local a = evalList(c[4]); local n = a.n
          for i=n,1,-1 do a[i+1]=a[i] end
          a[1] = self_v; a.n = n+1
          m(unpack(a, 1, a.n))
        end
        return
      end
      error("bad stmt op: "..tostring(op))
    end

    execBlock = function(block)
      for i=1,#block do
        local r = execStmt(block[i])
        if r == BRK then return BRK end
        if isRet(r) then return r end
      end
      return nil
    end

    local r = execBlock(proto.code)
    if isRet(r) then return r.vals end
    return nil
  end

  local a = ARGS or {}
  a.n = a.n or #a
  local r = runProto(PROTO, a, {})
  if r then return unpack(r, 1, r.n) end
end
`;
