import { describe, it, expect } from "vitest";
import { verify } from "../testHarness";

function ok(src: string) {
  const r = verify(src);
  if (!r.ok) {
    // eslint-disable-next-line no-console
    console.log("PROTECTED SOURCE:\n", r.protectedSource);
    throw new Error(r.reason);
  }
}

describe("vmObfuscator Phase 1", () => {
  it("arithmetic + precedence", () => {
    ok(`return 1 + 2 * 3 - 4 / 2, 2^10, 17 % 5`);
  });
  it("locals + globals", () => {
    ok(`local x = 10; y = x + 5; return x, y`);
  });
  it("string concat + length + comparison", () => {
    ok(`local s = "hi" .. " " .. "there"; return s, #s, s == "hi there", s < "hj"`);
  });
  it("if/elseif/else", () => {
    ok(`
      local function f(n)
        if n < 0 then return "neg"
        elseif n == 0 then return "zero"
        else return "pos" end
      end
      return f(-1), f(0), f(1)
    `);
  });
  it("while, repeat, numeric for (with step), break", () => {
    ok(`
      local s = 0
      local i = 1
      while i <= 5 do s = s + i; i = i + 1 end
      local t = 0
      repeat t = t + 1 until t >= 3
      local u = 0
      for k = 10, 2, -2 do u = u + k end
      for k = 1, 5 do if k == 3 then break end u = u + 100 end
      return s, t, u
    `);
  });
  it("tables: array + hash + mixed + nested", () => {
    ok(`
      local t = { 1, 2, 3, name = "x", [true] = "y" }
      t.child = { a = 1, b = { c = 2 } }
      return t[1], t[2], t[3], t.name, t[true], t.child.b.c, #t
    `);
  });
  it("generic for with pairs/ipairs", () => {
    ok(`
      local t = {10, 20, 30}
      local s = 0
      for _, v in ipairs(t) do s = s + v end
      local keys = {}
      local m = {a=1, b=2}
      -- ipairs only for determinism
      local u = 0
      for i, v in ipairs({7,8,9}) do u = u + i * v end
      return s, u
    `);
  });
  it("multiple return + multi-assign expansion", () => {
    ok(`
      local function two() return 1, 2 end
      local a, b, c = two(), 9
      local x, y, z = 0, two()
      return a, b, c, x, y, z
    `);
  });
});

describe("vmObfuscator Phase 2-3", () => {
  it("nested functions + upvalues", () => {
    ok(`
      local function counter()
        local n = 0
        return function() n = n + 1; return n end
      end
      local c = counter()
      return c(), c(), c()
    `);
  });
  it("recursive local function", () => {
    ok(`
      local function fact(n) if n <= 1 then return 1 else return n * fact(n-1) end end
      return fact(6)
    `);
  });
  it("varargs and select", () => {
    ok(`
      local function f(...) return select("#", ...), select(2, ...) end
      return f("a","b","c","d")
    `);
  });
  it("method call sugar", () => {
    ok(`
      local o = {x = 10}
      function o:add(n) return self.x + n end
      return o:add(5), o:add(7)
    `);
  });
  it("demo program from the request", () => {
    const r = verify(`
      local x = 10
      local y = 20
      local function add(a, b) return a + b end
      local result = add(x, y)
      print(result)
    `);
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.log("PROTECTED SOURCE:\n", r.protectedSource);
      throw new Error(r.reason);
    }
    expect(r.original!.output).toEqual(["30"]);
    expect(r.protectedRun!.output).toEqual(["30"]);
  });
});
