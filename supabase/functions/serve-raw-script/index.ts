import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dynamic CORS based on origin
function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = [
    "https://uwfuuhhcjlxgyeecpeii.lovableproject.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Persistent DB-backed rate limiter (survives cold starts)
async function checkRateLimitDB(
  supabase: any,
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    });
    if (error || !data || data.length === 0) {
      console.error('Rate limit check error:', error);
      // Fail open to avoid blocking legitimate requests
      return { allowed: true, remaining: limit, resetIn: windowMs };
    }
    const row = data[0];
    return { allowed: row.allowed, remaining: row.remaining, resetIn: row.reset_in };
  } catch (e) {
    console.error('Rate limit exception:', e);
    return { allowed: true, remaining: limit, resetIn: windowMs };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DefendLua Obfuscation Engine v16.0 - Military-Grade Protection
// ═══════════════════════════════════════════════════════════════════════════════

// String table encryption with dynamic key generation
const encryptStringTable = (strings: string[], masterKey: number): { table: number[][]; keys: number[] } => {
  const table: number[][] = [];
  const keys: number[] = [];
  for (let i = 0; i < strings.length; i++) {
    const key = (masterKey * (i + 7) + 31) % 256;
    keys.push(key);
    const encrypted: number[] = [];
    for (let j = 0; j < strings[i].length; j++) {
      const charCode = strings[i].charCodeAt(j);
      encrypted.push((charCode ^ key ^ ((j * 17) % 256)) % 256);
    }
    table.push(encrypted);
  }
  return { table, keys };
};

// Generate control flow state machine
const generateStateMachine = (rand: string, states: number): string => {
  const stateVar = `_SM_${rand}`;
  const jumpTable: string[] = [];
  for (let i = 0; i < states; i++) {
    const next = (i * 7 + 3) % states;
    jumpTable.push(`[${i}]=function() ${stateVar}=${next} end`);
  }
  return `local ${stateVar}=0\nlocal _JT_${rand}={${jumpTable.join(",")}}`;
};

// Opaque predicate generator
const generateOpaquePredicate = (rand: string, alwaysTrue: boolean): string => {
  const x = Math.floor(Math.random() * 100) + 1;
  const y = x * x;
  if (alwaysTrue) {
    return `((${x}*${x})==${y})`;
  } else {
    return `((${x}*${x})==${y + 1})`;
  }
};

// Generate metamethod hooks and anti-decompiler traps
const generateMetaTraps = (rand: string): string => {
  const vars = Array.from({ length: 12 }, (_, i) => `_MT${rand}${i}`);
  return `
local ${vars[0]}=setmetatable({},{
  __index=function(t,k)
    if k=="_G" or k=="getfenv" then return nil end
    return rawget(t,k)
  end,
  __newindex=function(t,k,v)
    if type(v)=="function" then
      rawset(t,k,function(...)
        local ${vars[1]}=select("#",...)
        if ${vars[1]}>100 then return nil end
        return v(...)
      end)
    else
      rawset(t,k,v)
    end
  end,
  __metatable="locked"
})
local ${vars[2]}=function()
  local ${vars[3]}=debug and debug.getinfo
  if ${vars[3]} then
    local ${vars[4]}=${vars[3]}(1)
    if ${vars[4]} and ${vars[4]}.what=="C" then return true end
  end
  return false
end`;
};

// Generate bytecode fingerprint check
const generateBytecodeCheck = (rand: string, seed: number): string => {
  const vars = Array.from({ length: 8 }, (_, i) => `_BC${rand}${i}`);
  const expected = ((seed * 31 + 17) % 65536).toString();
  return `
local ${vars[0]}=function(${vars[1]})
  if type(${vars[1]})~="function" then return 0 end
  local ${vars[2]}=0
  local ${vars[3]}=string.dump and pcall(string.dump,${vars[1]})
  if ${vars[3]} then
    local _,${vars[4]}=pcall(string.dump,${vars[1]})
    if ${vars[4]} then
      for ${vars[5]}=1,math.min(#${vars[4]},100) do
        ${vars[2]}=(${vars[2]}*31+string.byte(${vars[4]},${vars[5]}))%65536
      end
    end
  end
  return ${vars[2]}
end
local ${vars[6]}=${expected}`;
};

// Generate massive junk code footer with enhanced confusion
const generateJunkFooter = (
  rand: string,
  rand2: string,
  rand3: string,
  fakeVars: string[],
  salt: number,
  rot: number,
): string => {
  const junkFuncs = [];
  const funcNames = Array.from(
    { length: 20 },
    (_, i) => `_${["xX", "Xx", "zZ", "Zz", "yY", "Yy", "wW", "Ww", "vV", "Vv"][i % 10]}${rand2}${i}`,
  );

  // Fake VM instruction decoder
  junkFuncs.push(`
local ${funcNames[0]}={}
for _i=0,255 do ${funcNames[0]}[_i]=function(a,b,c)
  local r=(a or 0)+(b or 0)*(c or 1)
  return r%256,r/256
end end
local ${funcNames[1]}=function(${funcNames[2]})
  local ${funcNames[3]}={}
  for ${funcNames[4]}=1,#${funcNames[2]},3 do
    local op=${funcNames[2]}:byte(${funcNames[4]}) or 0
    local a=${funcNames[2]}:byte(${funcNames[4]}+1) or 0
    local b=${funcNames[2]}:byte(${funcNames[4]}+2) or 0
    local r1,r2=${funcNames[0]}[op](op,a,b)
    ${funcNames[3]}[#${funcNames[3]}+1]=r1
    ${funcNames[3]}[#${funcNames[3]}+1]=r2
  end
  return ${funcNames[3]}
end`);

  // Fake register allocator
  junkFuncs.push(`
local ${funcNames[5]}={}
for _r=0,31 do ${funcNames[5]}[_r]=0 end
local ${funcNames[6]}=function(${funcNames[7]})
  for _k,_v in pairs(${funcNames[7]} or {}) do
    if type(_k)=="number" and _k>=0 and _k<32 then
      ${funcNames[5]}[_k]=_v
    end
  end
end
local ${funcNames[8]}=function()
  local ${funcNames[9]}=0
  for _r=0,31 do ${funcNames[9]}=${funcNames[9]}+${funcNames[5]}[_r] end
  return ${funcNames[9]}%65536
end`);

  // Fake constant pool with encrypted strings
  const encStrings = Array.from({ length: 10 }, () =>
    Array.from({ length: Math.floor(Math.random() * 20) + 5 }, () => Math.floor(Math.random() * 256)),
  );
  junkFuncs.push(`
local ${funcNames[10]}={${encStrings.map((s, i) => `[${i}]={${s.join(",")}}`).join(",")}}
local ${funcNames[11]}=function(${funcNames[12]},${funcNames[13]})
  local ${funcNames[14]}=${funcNames[10]}[${funcNames[12]}]
  if not ${funcNames[14]} then return "" end
  local ${funcNames[15]}=""
  for _i=1,#${funcNames[14]} do
    ${funcNames[15]}=${funcNames[15]}..string.char((${funcNames[14]}[_i]-(${funcNames[13]} or 0))%256)
  end
  return ${funcNames[15]}
end`);

  // Fake upvalue inspector
  junkFuncs.push(`
local ${funcNames[16]}=function(${funcNames[17]})
  if type(${funcNames[17]})~="function" then return {} end
  local ${funcNames[18]}={}
  local _i=1
  while true do
    local _n,_v=debug and debug.getupvalue and debug.getupvalue(${funcNames[17]},_i)
    if not _n then break end
    ${funcNames[18]}[_n]=_v
    _i=_i+1
  end
  return ${funcNames[18]}
end`);

  // Anti-pattern matching traps
  const trapCode = `
local _TRAP_${rand}=function()
  local _patterns={
    "loadstring","getfenv","setfenv","debug","rawget","rawset",
    "getmetatable","setmetatable","require","dofile","loadfile"
  }
  local _hooks={}
  for _,_p in ipairs(_patterns) do
    if _G[_p] then
      _hooks[_p]=function(...)
        local _args={...}
        if #_args>0 and type(_args[1])=="string" then
          if _args[1]:find("DEOBF") or _args[1]:find("DEBUG") then
            return nil
          end
        end
        return _G[_p](...)
      end
    end
  end
  return _hooks
end`;

  // Fake encryption layers
  const cryptVars = Array.from({ length: 8 }, (_, i) => `_CRY${rand3}${i}`);
  const cryptCode = `
local ${cryptVars[0]}=function(${cryptVars[1]},${cryptVars[2]})
  local ${cryptVars[3]}=""
  local ${cryptVars[4]}=#${cryptVars[2]}
  for ${cryptVars[5]}=1,#${cryptVars[1]} do
    local ${cryptVars[6]}=string.byte(${cryptVars[1]},${cryptVars[5]})
    local ${cryptVars[7]}=string.byte(${cryptVars[2]},((${cryptVars[5]}-1)%${cryptVars[4]})+1)
    ${cryptVars[6]}=bit32 and bit32.bxor(${cryptVars[6]},${cryptVars[7]}) or ((${cryptVars[6]}>${cryptVars[7]}) and ${cryptVars[6]}-${cryptVars[7]} or 256+${cryptVars[6]}-${cryptVars[7]})
    ${cryptVars[3]}=${cryptVars[3]}..string.char(${cryptVars[6]}%256)
  end
  return ${cryptVars[3]}
end`;

  // Dead code blocks
  const deadCode = `
local _INTERNAL_VER="${rand}_v16.0.${salt}"
local _BUILD_TS=${Date.now()}
local _SIG_CHECK=0x${(salt * rot).toString(16).toUpperCase()}
local _ENV_HASH=${(salt + rot) * 31}
local _ANTI_TAMPER_KEY="${Math.random().toString(36).slice(2, 10)}"
local _INTEGRITY_SEED=${Math.floor(Math.random() * 0xffffff)}
if ${generateOpaquePredicate(rand, false)} then
  for _=1,0 do error("TAMPER_001") end
end
do
  local _scope_${rand}={init=false,verified=false,hash=0}
  if _scope_${rand}.init and ${generateOpaquePredicate(rand, false)} then
    while true do error("TAMPER_002") end
  end
end`;

  // Fake constant pool
  const constPool = `
local _CONST_POOL_${rand2}={
  [1]=${salt},[2]=${rot},[3]=${salt + rot},[4]=${(salt * rot) % 256},
  ["sig"]="${rand}",[5]="${rand2}",[6]="${rand3}",
  [7]=0x${salt.toString(16)},[8]=0x${rot.toString(16)},
  ["_verify"]=function(x) return (x*${salt}+${rot})%65536 end,
  ["_hash"]=function(s)
    local h=${salt}
    for i=1,#s do h=(h*31+string.byte(s,i))%2147483647 end
    return h
  end,
  ["_enc"]=function(d,k)
    local o=""
    for i=1,#d do o=o..string.char((string.byte(d,i)+k)%256) end
    return o
  end
}`;

  return `
--[[FOOTER_${rand}_${Date.now()}]]
${junkFuncs.join("\n")}
${trapCode}
${cryptCode}
${deadCode}
${constPool}
--[[INTEGRITY_SIG_${Math.random().toString(36).slice(2, 14)}]]
--[[BUILD_${Date.now()}_${salt}_${rot}]]
--[[END_DL16]]`;
};

// Main collector script generator - FULLY OBFUSCATED (simplified but reliable)
const generateCollectorScript = (scriptId: string, scriptSlug?: string, redeemKey?: string): string => {
  const redeemParam = redeemKey ? `&redeemkey=${encodeURIComponent(redeemKey)}` : "";
  const baseUrl = `https://api.defendlua.lol/s/${scriptSlug || scriptId}?key=`;

  // Generate unique random identifiers
  const ts = Date.now();
  const rand1 = Math.random().toString(36).slice(2, 8);
  const rand2 = Math.random().toString(36).slice(2, 8);
  const xorKey = Math.floor(Math.random() * 200) + 50;

  // Create the actual loader code (this will be encrypted)
  const actualLoaderCode = `local _URL="${baseUrl}"
 local function _GH()
 if gethwid then return gethwid()end
 if getexecutorhwid then return getexecutorhwid()end
 if get_hwid then return get_hwid()end
 if syn and syn.hwid then return syn.hwid()end
 if fluxus and fluxus.GetHWID then return fluxus.GetHWID()end
 if identifyexecutor then
 local ok,name=pcall(identifyexecutor)
 if ok and name then return name.."_"..tostring(math.floor(tick()*1000))end
 end
 if game and game.Players and game.Players.LocalPlayer then
 local p=game.Players.LocalPlayer
 return tostring(p.UserId).."_"..tostring(game.PlaceId).."_"..tostring(game.GameId)
 end
 return "DL_"..tostring(math.floor(tick()*100000)).."_"..tostring(math.random(100000,999999))
 end
 local function _UE(s)
 s=tostring(s or "")
 return (s:gsub("[^%w%-%_%.~]", function(c)
 return string.format("%%%02X", string.byte(c))
 end))
 end
 local _HW=_UE(_GH())
 local _RS=nil
 pcall(function()
 if game and game.HttpGet then
  local _RK="${redeemKey ? redeemKey.replace(/"/g, '\\"') : ""}"
  local _FULL=_URL.._HW..(_RK~="" and "&redeemkey=".._RK or "")
  _RS=game:HttpGet(_FULL)
  elseif syn and syn.request then
  local _RK="${redeemKey ? redeemKey.replace(/"/g, '\\"') : ""}"
  local _FULL=_URL.._HW..(_RK~="" and "&redeemkey=".._RK or "")
  local r=syn.request({Url=_FULL,Method="GET"})
  if r and r.Body then _RS=r.Body end
  elseif request then
  local _RK="${redeemKey ? redeemKey.replace(/"/g, '\\"') : ""}"
  local _FULL=_URL.._HW..(_RK~="" and "&redeemkey=".._RK or "")
  local r=request({Url=_FULL,Method="GET"})
  if r and r.Body then _RS=r.Body end
  elseif http_request then
  local _RK="${redeemKey ? redeemKey.replace(/"/g, '\\"') : ""}"
  local _FULL=_URL.._HW..(_RK~="" and "&redeemkey=".._RK or "")
  local r=http_request({Url=_FULL,Method="GET"})
  if r and r.Body then _RS=r.Body end
 end
 end)
 if _RS and #_RS>10 then
 local fn=loadstring(_RS)
 if fn then pcall(fn)end
 end`;

  // Simple XOR encryption that's guaranteed to work
  const encryptedBytes: number[] = [];
  for (let i = 0; i < actualLoaderCode.length; i++) {
    const byte = actualLoaderCode.charCodeAt(i);
    // Simple XOR with rotating key
    const encrypted = (byte ^ ((xorKey + (i % 8)) & 0xff)) & 0xff;
    encryptedBytes.push(encrypted);
  }

  // Variable names
  const v = {
    data: `_D${rand1}`,
    key: `_K${rand2}`,
    dec: `_X${rand1}`,
    res: `_R${rand2}`,
    exec: `_E${rand1}`,
  };

  // Generate junk variables for obfuscation
  const junk = Array.from({ length: 8 }, (_, i) => `_j${rand2}${i}`);

  // Build the obfuscated script
  const obfuscatedScript = `local ${junk[0]}={${Array.from({ length: 15 }, () => Math.floor(Math.random() * 256)).join(",")}}
local ${junk[1]}="${Math.random().toString(36).slice(2, 10)}"
local ${junk[2]}=${Math.floor(Math.random() * 10000)}
local ${v.data}={${encryptedBytes.join(",")}}
local ${v.key}=${xorKey}
 local ${v.dec}=function()
 local _t={}
 for i=1,#${v.data} do
 local c=${v.data}[i]
 local k=${v.key}+((i-1)%8)
 local b=c
 if bit32 then
 b=bit32.bxor(c,bit32.band(k,255))
 else
 local r,p=0,1
 local a,kb=c,k%256
 for _=1,8 do
 if a%2~=kb%2 then r=r+p end
 a=math.floor(a/2)
 kb=math.floor(kb/2)
 p=p*2
 end
 b=r
 end
 _t[i]=string.char(b)
 end
 return table.concat(_t)
 end
local ${junk[3]}=function()return ${junk[2]}*2 end
local ${junk[4]}={${Array.from({ length: 10 }, () => `"${Math.random().toString(36).slice(2, 5)}"`).join(",")}}
local ${v.exec}=function()
local s=${v.dec}()
if s and #s>5 then
local f=loadstring(s)
if f then pcall(f)end
end
end
local ${junk[5]}=tick and tick()or 0
local ${junk[6]}=math.random(1,100)
${v.exec}()
local ${junk[7]}=${junk[6]}+1`;

  return obfuscatedScript;
};

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create admin client for rate limiting
  const rateLimitClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Detect browser requests via Accept header or User-Agent
  const acceptHeader = req.headers.get("accept") || "";
  const userAgent = req.headers.get("user-agent") || "";
  const isBrowser =
    acceptHeader.includes("text/html") &&
    (userAgent.includes("Mozilla") ||
      userAgent.includes("Chrome") ||
      userAgent.includes("Safari") ||
      userAgent.includes("Edge"));

  if (isBrowser) {
    const browserErrorPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DefendLua — Hold Up!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #e2e8f0;
      overflow: hidden;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 480px;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .btn {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: #fff;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.95rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }
    .bg-glow {
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.15;
      pointer-events: none;
    }
    .glow-1 { background: #3b82f6; top: -100px; left: -100px; }
    .glow-2 { background: #8b5cf6; bottom: -100px; right: -100px; }
  </style>
</head>
<body>
  <div class="bg-glow glow-1"></div>
  <div class="bg-glow glow-2"></div>
  <div class="container">
    <div class="icon">🛡️</div>
    <h1>Hold up! Seems like you got confused.</h1>
    <p>If you're looking for DefendLua, click below.</p>
    <a href="https://defendlua.lol" class="btn">Go to DefendLua</a>
  </div>
</body>
</html>`;
    return new Response(browserErrorPage, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const url = new URL(req.url);
    let scriptId = url.searchParams.get("id");
    const scriptSlug = url.searchParams.get("slug");
    const hwid = url.searchParams.get("key") || url.searchParams.get("hwid");
    const redeemKey = url.searchParams.get("redeemkey");

    // Get client IP for rate limiting
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-country") ||
      null;

    // Rate limit by IP: 30 requests per minute (persistent, survives cold starts)
    const ipRateLimit = await checkRateLimitDB(rateLimitClient, `ip:${clientIp}`, 30, 60000);
    if (!ipRateLimit.allowed) {
      console.warn("Rate limit exceeded for IP:", clientIp);
      return new Response('print("ERROR: Rate limit exceeded. Please wait before trying again.")', {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain",
          "Retry-After": Math.ceil(ipRateLimit.resetIn / 1000).toString(),
        },
      });
    }

    if (!scriptId && !scriptSlug) {
      return new Response('print("ERROR: Script ID not provided")', {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Determine if the provided scriptId is a UUID or a slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const lookupSlug = scriptSlug || (scriptId && !uuidRegex.test(scriptId) ? scriptId : null);

    // If we have a slug (explicit or detected), resolve to UUID
    if (lookupSlug) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data: slugScript } = await supabaseAdmin
        .from("scripts")
        .select("id, slug")
        .eq("slug", lookupSlug)
        .single();
      if (!slugScript) {
        return new Response('local player = game.Players.LocalPlayer\nplayer:Kick("Invalid Key")', {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }
      scriptId = slugScript.id;
    }

    // Rate limit by script ID: 100 requests per hour per script (persistent)
    const scriptRateLimit = await checkRateLimitDB(rateLimitClient, `script:${scriptId}`, 100, 3600000);
    if (!scriptRateLimit.allowed) {
      console.warn("Rate limit exceeded for script:", scriptId);
      return new Response('print("ERROR: Script rate limit exceeded. Please try again later.")', {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain",
          "Retry-After": Math.ceil(scriptRateLimit.resetIn / 1000).toString(),
        },
      });
    }

    if (!hwid) {
      console.log("Stage 1 - Serving HWID collector:", { scriptId });

      const collectorScript = generateCollectorScript(scriptId, lookupSlug || undefined, redeemKey || undefined);
      return new Response(collectorScript, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    console.log("Stage 2 - Validating access:", { scriptId, hwid: "provided" });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Reuse client IP derived earlier (used for rate limiting and logging)
    // (Do not redeclare to avoid Deno runtime boot errors)

    console.log("Request details:", { scriptId, hwid: hwid ? "provided" : "missing", clientIp });

    const { data: script, error } = await supabaseAdmin
      .from("scripts")
      .select(
        "script_key, hwid_list, ip_list, hwid_blacklist, public_access, script_name, owner_id, webhook_url, show_watermark, disabled",
      )
      .eq("id", scriptId)
      .single();

    if (error || !script) {
      console.error("Script not found:", error);

      // Log the access attempt for debugging (server-side only)
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid: hwid || "unknown",
        ip_address: clientIp,
        country,
        status: "denied",
        reason: "Script not found",
      });

      // Return identical response to access denied to prevent script ID enumeration
      return new Response('local player = game.Players.LocalPlayer\nplayer:Kick("Invalid Key")', {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    if ((script as any).disabled) {
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid: hwid || "unknown",
        ip_address: clientIp,
        country,
        status: "denied",
        reason: "Script disabled (plan limit)",
      });
      return new Response('local player = game.Players.LocalPlayer\nplayer:Kick("Script disabled — owner exceeded plan limits")', {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan")
      .eq("user_id", script.owner_id)
      .single();

    const userPlan = subscription?.plan || "free";
    const hwidList = script.hwid_list || [];
    const ipList = script.ip_list || [];
    const hwidBlacklist = script.hwid_blacklist || [];
    const publicAccess = script.public_access || false;
    const webhookUrl = (script as any).webhook_url;

    const sendDiscordWebhook = async (status: string, reason: string, color: number) => {
      if (!webhookUrl || (userPlan !== "pro" && userPlan !== "enterprise")) return;

      const discordWebhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;
      if (!discordWebhookRegex.test(webhookUrl)) {
        console.warn("Invalid Discord webhook URL format, skipping webhook notification");
        return;
      }

      try {
        const embed = {
          title: `DefendLua Access Log`,
          description: `**Script:** ${script.script_name}`,
          color: color,
          fields: [
            { name: "Status", value: status, inline: true },
            { name: "Reason", value: reason, inline: true },
            { name: "HWID", value: `\`${hwid}\``, inline: false },
            { name: "IP Address", value: `\`${clientIp}\``, inline: true },
            { name: "Script ID", value: `\`${scriptId}\``, inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "DefendLua Protection System" },
        };

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [embed],
            components:
              status === "denied"
                ? []
                : [
                    {
                      type: 1,
                      components: [
                        {
                          type: 2,
                          style: 4,
                          label: "Blacklist this HWID",
                          custom_id: `blacklist_${hwid.slice(0, 50)}`,
                        },
                      ],
                    },
                  ],
          }),
        });
      } catch (webhookError) {
        console.error("Failed to send webhook:", webhookError);
      }
    };

    if (hwidBlacklist.includes(hwid)) {
      console.log("Access denied - HWID blacklisted:", { scriptId, hwid });

      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid: hwid,
        ip_address: clientIp,
        country,
        status: "denied",
        reason: "HWID blacklisted",
      });

      await sendDiscordWebhook("Denied", "HWID Blacklisted", 0xff0000);

      // Return identical response to prevent enumeration
      return new Response('local player = game.Players.LocalPlayer\nplayer:Kick("Invalid Hwid.")', {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const getHwidLimit = (plan: string): number => {
      switch (plan) {
        case "enterprise":
          return 1000;
        case "pro":
          return 100;
        default:
          return 10;
      }
    };
    const hwidLimit = getHwidLimit(userPlan);

    const isHwidWhitelisted = hwidList.includes(hwid);
    const isIpWhitelisted = ipList.length === 0 || ipList.includes(clientIp);

    // ── Key-based access: verify redeemkey on EVERY request ──
    let redeemWhitelisted = false;
    if (redeemKey) {
      const { data: keyData } = await supabaseAdmin
        .from("generated_keys")
        .select("id, redeemed, redeemed_hwid, expires_at, script_id")
        .eq("key", redeemKey.toUpperCase().trim())
        .eq("script_id", scriptId)
        .single();

      if (keyData && new Date(keyData.expires_at) > new Date()) {
        if (!keyData.redeemed) {
          // First-time redemption: lock key to this HWID
          const { data: config } = await supabaseAdmin
            .from("key_system_configs")
            .select("redeem_action")
            .eq("script_id", scriptId)
            .single();

          await supabaseAdmin
            .from("generated_keys")
            .update({
              redeemed: true,
              redeemed_at: new Date().toISOString(),
              redeemed_hwid: hwid,
            })
            .eq("id", keyData.id);

          // Always add HWID to whitelist on key redemption (so it shows on the website)
          // This covers both key system "whitelist" mode and direct /whitelist command keys
          const shouldWhitelist = !config || config.redeem_action === "whitelist";
          if (shouldWhitelist && !hwidList.includes(hwid) && hwidList.length < hwidLimit) {
            const updatedList = [...hwidList, hwid];
            await supabaseAdmin.from("scripts").update({ hwid_list: updatedList }).eq("id", scriptId);
          }
          redeemWhitelisted = true;
          console.log("Key redeemed and HWID-locked:", { scriptId, hwid, key: redeemKey });
        } else if (keyData.redeemed_hwid === hwid) {
          // Key already redeemed by THIS HWID — allow access
          redeemWhitelisted = true;
          console.log("Key re-used by same HWID:", { scriptId, hwid });
        } else {
          // Key redeemed by a DIFFERENT HWID — deny
          console.log("Key HWID mismatch:", { scriptId, expected: keyData.redeemed_hwid, got: hwid });
          await supabaseAdmin.from("access_logs").insert({
            script_id: scriptId,
            hwid,
            ip_address: clientIp,
        country,
            status: "denied",
            reason: "Key HWID mismatch",
          });
          await sendDiscordWebhook("Denied", "Key HWID Mismatch", 0xff0000);
          return new Response(
            'local player = game.Players.LocalPlayer\nplayer:Kick("This key is locked to a different hwid.")',
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "text/plain" },
            },
          );
        }
      } else if (keyData && new Date(keyData.expires_at) <= new Date()) {
        // Key expired
        await supabaseAdmin.from("access_logs").insert({
          script_id: scriptId,
          hwid,
          ip_address: clientIp,
        country,
          status: "denied",
          reason: "Key expired",
        });
        return new Response('local player = game.Players.LocalPlayer\nplayer:Kick("Your key has expired.")', {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }
    }

    if (publicAccess && !isHwidWhitelisted && !redeemWhitelisted && (userPlan === "pro" || userPlan === "enterprise")) {
      if (hwidList.length < hwidLimit) {
        const updatedHwidList = [...hwidList, hwid];
        await supabaseAdmin.from("scripts").update({ hwid_list: updatedHwidList }).eq("id", scriptId);
        console.log("Auto-whitelisted HWID for public access script:", { scriptId, hwid });
      }
    }

    const accessAllowed = publicAccess || redeemWhitelisted || (isHwidWhitelisted && isIpWhitelisted);

    if (!accessAllowed) {
      console.log("Access denied:", { scriptId, hwid, isHwidWhitelisted, isIpWhitelisted, publicAccess });

      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid: hwid,
        ip_address: clientIp,
        country,
        status: "denied",
        reason: !isHwidWhitelisted ? "HWID not whitelisted" : "IP not whitelisted",
      });

      await sendDiscordWebhook("Denied", !isHwidWhitelisted ? "HWID Not Whitelisted" : "IP Not Whitelisted", 0xff0000);

      // Return identical response to script-not-found to prevent enumeration
      return new Response('local player = game.Players.LocalPlayer\nplayer:Kick("Invalid Hwid.")', {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    await supabaseAdmin.from("access_logs").insert({
      script_id: scriptId,
      hwid: hwid,
      ip_address: clientIp,
        country,
      status: "granted",
      reason: publicAccess ? "Public access" : "Whitelisted",
    });

    await sendDiscordWebhook("Granted", publicAccess ? "Public Access" : "Whitelisted", 0x00ff00);

    console.log("Access granted - serving script:", { scriptId });

    // ═══════════════════════════════════════════════════════════════════════════════
    // OBFUSCATION ENGINE - Multi-layer protection for served scripts
    // ═══════════════════════════════════════════════════════════════════════════════

    const obfuscateScript = (source: string, hwid: string): string => {
      const timestamp = Date.now();
      const rand1 = Math.random().toString(36).slice(2, 10);
      const rand2 = Math.random().toString(36).slice(2, 10);
      const rand3 = Math.random().toString(36).slice(2, 10);
      const salt = Math.floor(Math.random() * 10000) + 1000;

      // Generate dynamic encryption key based on HWID and timestamp
      const masterKey = hwid.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), timestamp % 1000);

      // Encrypt the source code with multi-layer XOR cipher
      const encryptSource = (src: string, key: number): number[] => {
        const result: number[] = [];
        const keyBytes = [
          (key >> 24) & 0xff,
          (key >> 16) & 0xff,
          (key >> 8) & 0xff,
          key & 0xff,
          (key * 7) & 0xff,
          (key * 13) & 0xff,
          (key * 31) & 0xff,
          (key * 47) & 0xff,
        ];
        for (let i = 0; i < src.length; i++) {
          let byte = src.charCodeAt(i);
          // Layer 1: XOR with rotating key
          byte ^= keyBytes[i % keyBytes.length];
          // Layer 2: Add position-based shift
          byte = (byte + i * 7) & 0xff;
          // Layer 3: XOR with previous byte
          if (i > 0) byte ^= result[i - 1] & 0x3f;
          result.push(byte);
        }
        return result;
      };

      const encryptedBytes = encryptSource(source, masterKey);

      // Split into chunks for harder analysis
      const chunkSize = Math.floor(encryptedBytes.length / 4) + 1;
      const chunks: number[][] = [];
      for (let i = 0; i < encryptedBytes.length; i += chunkSize) {
        chunks.push(encryptedBytes.slice(i, i + chunkSize));
      }

      // Variable name generator with random prefixes
      const varNames = {
        data: `_D${rand1}`,
        key: `_K${rand1}`,
        result: `_R${rand2}`,
        decrypt: `_X${rand2}`,
        verify: `_V${rand3}`,
        exec: `_E${rand3}`,
        chunk: chunks.map((_, i) => `_C${rand1}${i}`),
        keyBytes: `_KB${rand2}`,
        antiDebug: `_AD${rand3}`,
        integrityCheck: `_IC${rand1}`,
        hwidCheck: `_HC${rand2}`,
        envCheck: `_EC${rand3}`,
        timeCheck: `_TC${rand1}`,
        selfCheck: `_SC${rand2}`,
      };

      // Calculate integrity hash of encrypted data
      const integrityHash = encryptedBytes.reduce((acc, b, i) => (acc * 31 + b + i) >>> 0, salt);

      // Generate anti-debug checks (relaxed for Roblox executors)
      const antiDebugCode = `
local ${varNames.antiDebug}=function()
  if _G["DEOBF_FLAG"] or _G["DEBUG_MODE"] or _G["UNLUAC"] or _G["UNLUAU"] then return false end
  if debug and debug.gethook then
    local _h=debug.gethook()
    if _h and type(_h)=="function" then
      local _info=debug.getinfo and debug.getinfo(_h,"S")
      if _info and _info.what=="Lua" then return false end
    end
  end
  return true
end`;

      // Generate HWID verification (binds script to specific HWID)
      const hwidHash = hwid.split("").reduce((acc, c, i) => (acc * 37 + c.charCodeAt(0)) >>> 0, 0);
      const hwidCheckCode = `
local ${varNames.hwidCheck}=function()
  local _hwid=nil
  if gethwid then _hwid=gethwid()
  elseif getexecutorhwid then _hwid=getexecutorhwid()
  elseif get_hwid then _hwid=get_hwid()
  elseif syn and syn.hwid then _hwid=syn.hwid()
  elseif fluxus and fluxus.GetHWID then _hwid=fluxus.GetHWID()
  end
  if not _hwid then return true end
  local _h=0
  for i=1,#_hwid do _h=(_h*37+string.byte(_hwid,i))%4294967296 end
  return _h==${hwidHash}
end`;

      // Generate environment integrity check (Roblox-safe, no string.dump)
      const envCheckCode = `
local ${varNames.envCheck}=function()
  if _G["DEOBF_FLAG"] or _G["DEBUG_MODE"] or _G["UNLUAC"] or _G["UNLUAU"] then return false end
  return true
end`;

      // Generate time-based check (prevents analysis by detecting long pauses)
      const timeCheckCode = `
local ${varNames.timeCheck}=(os.clock and os.clock() or tick and tick() or 0)`;

      // Generate self-integrity verification (Roblox-safe, no string.dump)
      const selfCheckCode = `
local ${varNames.selfCheck}=function(_fn)
  return type(_fn)=="function"
end`;

      // Build decryption function
      const decryptCode = `
local ${varNames.keyBytes}={${[
        (masterKey >> 24) & 0xff,
        (masterKey >> 16) & 0xff,
        (masterKey >> 8) & 0xff,
        masterKey & 0xff,
        (masterKey * 7) & 0xff,
        (masterKey * 13) & 0xff,
        (masterKey * 31) & 0xff,
        (masterKey * 47) & 0xff,
      ].join(",")}}
local ${varNames.decrypt}=function(${varNames.data})
  local _t={}
  local _prev=0
  for i=1,#${varNames.data} do
    local _b=${varNames.data}[i]
    if i>1 then _b=bit32 and bit32.bxor(_b,_prev%64) or ((_b>=(_prev%64)) and _b-(_prev%64) or 256+_b-(_prev%64))%256 end
    _prev=${varNames.data}[i]
    _b=(_b-((i-1)*7))%256
    if _b<0 then _b=_b+256 end
    local _k=${varNames.keyBytes}[((i-1)%8)+1]
    _b=bit32 and bit32.bxor(_b,_k) or ((_b>=_k) and _b-_k or 256+_b-_k)%256
    _t[i]=string.char(_b)
  end
  return table.concat(_t)
end`;

      // Build data chunks
      const chunkDefs = chunks.map((chunk, i) => `local ${varNames.chunk[i]}={${chunk.join(",")}}`).join("\n");

      // Combine chunks
      const combineCode = `
local ${varNames.data}={}
${chunks.map((_, i) => `for _,v in ipairs(${varNames.chunk[i]}) do ${varNames.data}[#${varNames.data}+1]=v end`).join("\n")}`;

      // Integrity verification
      const integrityCode = `
local ${varNames.integrityCheck}=function()
  local _h=${salt}
  for i=1,#${varNames.data} do _h=(_h*31+${varNames.data}[i]+i-1)%4294967296 end
  return _h==${integrityHash}
end`;

      // Execution wrapper with all protections
      const execCode = `
 local ${varNames.exec}=function()
   if not ${varNames.antiDebug}() then
     return warn("[DefendLua] Security check failed: Debug detected")
   end
   if not ${varNames.hwidCheck}() then
     return warn("[DefendLua] Security check failed: HWID mismatch")
   end
   if not ${varNames.envCheck}() then
     return warn("[DefendLua] Security check failed: Environment tampered")
   end
   if not ${varNames.integrityCheck}() then
     return warn("[DefendLua] Security check failed: Data corrupted")
   end
   local _elapsed=(os.clock and os.clock() or tick and tick() or 0)-${varNames.timeCheck}
   if _elapsed>5 then
     return warn("[DefendLua] Security check failed: Timeout exceeded")
   end
   local _src=${varNames.decrypt}(${varNames.data})
   if not _src or #_src<5 then
     return warn("[DefendLua] Decryption failed")
   end
   local _fn,_err=loadstring(_src)
   if not _fn then
     return warn("[DefendLua] Load error: "..tostring(_err))
   end
   if not ${varNames.selfCheck}(_fn) then
     return warn("[DefendLua] Security check failed: Function tampered")
   end

   -- Safe JSON sanitizer (available globally for user scripts)
   pcall(function()
     if not _G._DL_SAN then
       _G._DL_SAN=function(v,depth)
         depth=depth or 0
         if depth>4 then return tostring(v) end
         local t=type(v)
         if t=="nil" or t=="string" or t=="boolean" then return v end
         if t=="number" then
           if v~=v or v==math.huge or v==-math.huge then return 0 end
           return v
         end
         if t=="table" then
           local o={}
           for k,val in pairs(v) do
             local kk=(type(k)=="string" or type(k)=="number") and k or tostring(k)
             local vv=_G._DL_SAN(val,depth+1)
             if vv~=nil then o[kk]=vv end
           end
           return o
         end
         return tostring(v)
       end
     end
   end)

   local _handler=function(e)
     if debug and debug.traceback then
       return debug.traceback(e,2)
     end
     return tostring(e)
   end
   local _ok,_runErr=xpcall(_fn,_handler)
   if not _ok then
     warn("[DefendLua] Runtime error: "..tostring(_runErr))
   end
 end`;

      // Generate junk code to confuse decompilers (Roblox-compatible)
      const junkVars = Array.from({ length: 15 }, (_, i) => `_J${rand3}${i}`);
      const junkCode = `
local ${junkVars[0]}=setmetatable({},{__index=function() return function() end end,__metatable="protected"})
local ${junkVars[1]}=function(...) local _a={...} return #_a>0 and _a[1] or nil end
local ${junkVars[2]}={${Array.from({ length: 20 }, () => Math.floor(Math.random() * 256)).join(",")}}
local ${junkVars[3]}=function(_x) return _x and tonumber(tostring(_x or "0"):reverse()) or 0 end
local ${junkVars[4]}=string.rep("\\0",${Math.floor(Math.random() * 50) + 10})
local ${junkVars[5]}={__mode="kv",__index=${junkVars[0]}}
local ${junkVars[6]}=function() return ${salt} end
local ${junkVars[7]}=select("#",pcall(function() end))
local ${junkVars[8]}="${rand1}${rand2}"
local ${junkVars[9]}=${timestamp % 65536}`;

      // Anti-hook preamble: detects loadstring/HttpGet hijacking, reports to
      // the tamper endpoint (server logs IP, resolves Discord user from HWID),
      // then kicks + errors — no infinite loop.
      const scriptSlugEsc = (script.slug || "").replace(/"/g, '\\"');
      const hwidEsc = hwid.replace(/"/g, '\\"');
      const antiHookCode = `
local _DL_report=function(_reason)
  pcall(function()
    local _u="https://api.defendlua.lol/functions/v1/report-tamper?s=${scriptSlugEsc}&h=${hwidEsc}&r="..tostring(_reason)
    if game and game.HttpGet then pcall(function() game:HttpGet(_u) end)
    elseif syn and syn.request then pcall(function() syn.request({Url=_u,Method="GET"}) end)
    elseif request then pcall(function() request({Url=_u,Method="GET"}) end)
    elseif http_request then pcall(function() http_request({Url=_u,Method="GET"}) end)
    end
  end)
end
local _DL_kick=function(_r)
  _DL_report(_r)
  pcall(function()
    local _plr=game:GetService("Players").LocalPlayer
    if _plr then _plr:Kick("[DefendLua] "..tostring(_r)) end
  end)
  error("[DefendLua] "..tostring(_r),0)
end
-- 1) C-closure check
if type(iscclosure)=="function" then
  local _o1,_r1=pcall(iscclosure,loadstring)
  if _o1 and _r1==false then _DL_kick("loadstring_hooked") end
  local _o2,_r2=pcall(iscclosure,game.HttpGet)
  if _o2 and _r2==false then _DL_kick("httpget_hooked") end
end
-- 2) debug.info source check
if type(debug)=="table" and type(debug.info)=="function" then
  local _o,_s=pcall(debug.info,loadstring,"s")
  if _o and type(_s)=="string" and _s~="" and _s~="[C]" and _s~="=[C]" then
    _DL_kick("loadstring_lua_wrapper")
  end
end
-- 3) Fallback: tostring of a real C function has no source path
local _o3,_ts=pcall(tostring,loadstring)
if _o3 and type(_ts)=="string" and _ts:find(":%d") then
  _DL_kick("loadstring_tostring_leak")
end`;


      // Build final protected script
      const protectedScript = `--[[DefendLua v17.1 | ${timestamp} | ${rand1}]]
do
${antiHookCode}
${junkCode}
${antiDebugCode}
${hwidCheckCode}
${envCheckCode}
${timeCheckCode}
${selfCheckCode}
${decryptCode}
${chunkDefs}
${combineCode}
${integrityCode}
${execCode}
${varNames.exec}()
end
--[[${Math.random().toString(36).slice(2)}]]`;


      return protectedScript;
    };

    const protectedScript = obfuscateScript(script.script_key, hwid);

    // Check owner's subscription plan for promotional watermark
    let ownerPlan = "free";
    const { data: ownerSub } = await supabaseAdmin
      .from("subscriptions")
      .select("plan")
      .eq("user_id", script.owner_id)
      .maybeSingle();
    if (ownerSub) {
      ownerPlan = ownerSub.plan;
    }

    // Inject promotional watermark for free plan users (cannot be removed)
    const promotionCode = `
local _DL_SG = Instance.new("ScreenGui")
local _DL_FR = Instance.new("Frame")
local _DL_PR = Instance.new("TextLabel")
local _DL_US = Instance.new("UIStroke")
_DL_SG.Parent = game.Players.LocalPlayer:WaitForChild("PlayerGui")
_DL_SG.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
_DL_SG.ResetOnSpawn = false
_DL_FR.Parent = _DL_SG
_DL_FR.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
_DL_FR.BackgroundTransparency = 1.000
_DL_FR.Position = UDim2.new(1, -180, 0, 10)
_DL_FR.Size = UDim2.new(0, 170, 0, 60)
_DL_PR.Name = "Promotion"
_DL_PR.Parent = _DL_FR
_DL_PR.BackgroundTransparency = 1.000
_DL_PR.Size = UDim2.new(1, 0, 1, 0)
_DL_PR.Font = Enum.Font.LuckiestGuy
_DL_PR.Text = "DEFENDLUA.LOL"
_DL_PR.TextColor3 = Color3.fromRGB(255, 255, 255)
_DL_PR.TextScaled = true
_DL_PR.TextWrapped = true
_DL_US.Parent = _DL_PR
_DL_US.Thickness = 2.5
_DL_US.Transparency = 0
task.spawn(function()
    local _h = 0
    while task.wait() do
        _h = _h + (1/300)
        if _h > 1 then _h = 0 end
        _DL_PR.TextColor3 = Color3.fromHSV(_h, 0.8, 1)
    end
end)
`;

    // Free users: always show watermark. Pro/Enterprise: respect show_watermark setting
    const shouldShowWatermark = ownerPlan === "free" ? true : (script as any).show_watermark !== false;

    const finalScript = shouldShowWatermark ? promotionCode + "\n" + protectedScript : protectedScript;

    return new Response(finalScript, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response('print("ERROR: An unexpected error occurred")', {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
