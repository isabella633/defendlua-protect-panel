import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DefendLua Obfuscation Engine v16.0 - Military-Grade Protection
// ═══════════════════════════════════════════════════════════════════════════════

// String table encryption with dynamic key generation
const encryptStringTable = (strings: string[], masterKey: number): { table: number[][], keys: number[] } => {
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
  return `local ${stateVar}=0\nlocal _JT_${rand}={${jumpTable.join(',')}}`;
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
const generateJunkFooter = (rand: string, rand2: string, rand3: string, fakeVars: string[], salt: number, rot: number): string => {
  const junkFuncs = [];
  const funcNames = Array.from({length: 20}, (_, i) => `_${['xX','Xx','zZ','Zz','yY','Yy','wW','Ww','vV','Vv'][i % 10]}${rand2}${i}`);
  
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
  const encStrings = Array.from({length: 10}, () => 
    Array.from({length: Math.floor(Math.random() * 20) + 5}, () => 
      Math.floor(Math.random() * 256)
    )
  );
  junkFuncs.push(`
local ${funcNames[10]}={${encStrings.map((s, i) => `[${i}]={${s.join(',')}}`).join(',')}}
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
  const cryptVars = Array.from({length: 8}, (_, i) => `_CRY${rand3}${i}`);
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
local _INTEGRITY_SEED=${Math.floor(Math.random() * 0xFFFFFF)}
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
  [1]=${salt},[2]=${rot},[3]=${salt+rot},[4]=${salt*rot%256},
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
${junkFuncs.join('\n')}
${trapCode}
${cryptCode}
${deadCode}
${constPool}
--[[INTEGRITY_SIG_${Math.random().toString(36).slice(2, 14)}]]
--[[BUILD_${Date.now()}_${salt}_${rot}]]
--[[END_DL16]]`;
};

// Main collector script generator - FULLY OBFUSCATED (simplified but reliable)
const generateCollectorScript = (scriptId: string): string => {
  const baseUrl = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=${scriptId}&key=`;
  
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
local _HW=_GH()
local _RS=nil
pcall(function()
if game and game.HttpGet then
_RS=game:HttpGet(_URL.._HW)
elseif syn and syn.request then
local r=syn.request({Url=_URL.._HW,Method="GET"})
if r and r.Body then _RS=r.Body end
elseif request then
local r=request({Url=_URL.._HW,Method="GET"})
if r and r.Body then _RS=r.Body end
elseif http_request then
local r=http_request({Url=_URL.._HW,Method="GET"})
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
    const encrypted = (byte ^ ((xorKey + (i % 8)) & 0xFF)) & 0xFF;
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
  const junk = Array.from({length: 8}, (_, i) => `_j${rand2}${i}`);
  
  // Build the obfuscated script
  const obfuscatedScript = `local ${junk[0]}={${Array.from({length: 15}, () => Math.floor(Math.random() * 256)).join(',')}}
local ${junk[1]}="${Math.random().toString(36).slice(2, 10)}"
local ${junk[2]}=${Math.floor(Math.random() * 10000)}
local ${v.data}={${encryptedBytes.join(',')}}
local ${v.key}=${xorKey}
local ${v.dec}=function()
local ${v.res}=""
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
${v.res}=${v.res}..string.char(b)
end
return ${v.res}
end
local ${junk[3]}=function()return ${junk[2]}*2 end
local ${junk[4]}={${Array.from({length: 10}, () => `"${Math.random().toString(36).slice(2, 5)}"`).join(',')}}
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const scriptId = url.searchParams.get("id");
    const hwid = url.searchParams.get("key") || url.searchParams.get("hwid");

    if (!scriptId) {
      return new Response('print("ERROR: Script ID not provided")', {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    if (!hwid) {
      console.log("Stage 1 - Serving HWID collector:", { scriptId });
      
      const collectorScript = generateCollectorScript(scriptId);
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

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

    console.log("Request details:", { scriptId, hwid: hwid ? "provided" : "missing", clientIp });

    const { data: script, error } = await supabaseAdmin
      .from("scripts")
      .select("script_key, hwid_list, ip_list, hwid_blacklist, public_access, script_name, owner_id, webhook_url")
      .eq("id", scriptId)
      .single();

    if (error || !script) {
      console.error("Script not found:", error);
      return new Response(
        'print("ERROR: Script not found")',
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
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
          footer: { text: "DefendLua Protection System" }
        };

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [embed],
            components: status === "denied" ? [] : [{
              type: 1,
              components: [{
                type: 2,
                style: 4,
                label: "Blacklist this HWID",
                custom_id: `blacklist_${hwid.slice(0, 50)}`
              }]
            }]
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
        status: "denied",
        reason: "HWID blacklisted",
      });
      
      await sendDiscordWebhook("Denied", "HWID Blacklisted", 0xFF0000);

      return new Response(
        'print("ACCESS DENIED: Your HWID has been blacklisted")',
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    const getHwidLimit = (plan: string): number => {
      switch (plan) {
        case "enterprise": return 1000;
        case "pro": return 100;
        default: return 10;
      }
    };
    const hwidLimit = getHwidLimit(userPlan);

    const isHwidWhitelisted = hwidList.includes(hwid);
    const isIpWhitelisted = ipList.length === 0 || ipList.includes(clientIp);
    
    if (publicAccess && !isHwidWhitelisted && (userPlan === "pro" || userPlan === "enterprise")) {
      if (hwidList.length < hwidLimit) {
        const updatedHwidList = [...hwidList, hwid];
        await supabaseAdmin
          .from("scripts")
          .update({ hwid_list: updatedHwidList })
          .eq("id", scriptId);
        console.log("Auto-whitelisted HWID for public access script:", { scriptId, hwid });
      }
    }

    const accessAllowed = publicAccess || (isHwidWhitelisted && isIpWhitelisted);

    if (!accessAllowed) {
      console.log("Access denied:", { scriptId, hwid, isHwidWhitelisted, isIpWhitelisted, publicAccess });
      
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid: hwid,
        ip_address: clientIp,
        status: "denied",
        reason: !isHwidWhitelisted ? "HWID not whitelisted" : "IP not whitelisted",
      });
      
      await sendDiscordWebhook("Denied", !isHwidWhitelisted ? "HWID Not Whitelisted" : "IP Not Whitelisted", 0xFF0000);

      return new Response(
        'print("ACCESS DENIED: You are not authorized")',
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    await supabaseAdmin.from("access_logs").insert({
      script_id: scriptId,
      hwid: hwid,
      ip_address: clientIp,
      status: "granted",
      reason: publicAccess ? "Public access" : "Whitelisted",
    });
    
    await sendDiscordWebhook("Granted", publicAccess ? "Public Access" : "Whitelisted", 0x00FF00);

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
      const masterKey = hwid.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), timestamp % 1000);
      
      // Encrypt the source code with multi-layer XOR cipher
      const encryptSource = (src: string, key: number): number[] => {
        const result: number[] = [];
        const keyBytes = [
          (key >> 24) & 0xFF,
          (key >> 16) & 0xFF,
          (key >> 8) & 0xFF,
          key & 0xFF,
          (key * 7) & 0xFF,
          (key * 13) & 0xFF,
          (key * 31) & 0xFF,
          (key * 47) & 0xFF
        ];
        for (let i = 0; i < src.length; i++) {
          let byte = src.charCodeAt(i);
          // Layer 1: XOR with rotating key
          byte ^= keyBytes[i % keyBytes.length];
          // Layer 2: Add position-based shift
          byte = (byte + (i * 7)) & 0xFF;
          // Layer 3: XOR with previous byte
          if (i > 0) byte ^= result[i - 1] & 0x3F;
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
      const hwidHash = hwid.split('').reduce((acc, c, i) => (acc * 37 + c.charCodeAt(0)) >>> 0, 0);
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
      
      // Generate environment integrity check
      const envCheckCode = `
local ${varNames.envCheck}=function()
  local _dangerous={"getfenv","setfenv","debug.setupvalue","debug.setlocal"}
  for _,_n in ipairs(_dangerous) do
    local _parts={}
    for _p in _n:gmatch("[^.]+") do _parts[#_parts+1]=_p end
    local _v=_G
    for _,_p in ipairs(_parts) do
      if type(_v)=="table" then _v=_v[_p] else break end
    end
    if _v and type(_v)=="function" then
      local _ok,_err=pcall(function() return string.dump(_v) end)
      if not _ok then return false end
    end
  end
  return true
end`;
      
      // Generate time-based check (prevents analysis by detecting long pauses)
      const timeCheckCode = `
local ${varNames.timeCheck}=(os.clock and os.clock() or tick and tick() or 0)`;
      
      // Generate self-integrity verification
      const selfCheckCode = `
local ${varNames.selfCheck}=function(_fn)
  if type(_fn)~="function" then return false end
  local _ok,_dump=pcall(string.dump,_fn)
  if not _ok or not _dump then return true end
  local _h=0
  for i=1,math.min(#_dump,200) do
    _h=(_h*31+string.byte(_dump,i))%2147483647
  end
  return _h>0
end`;
      
      // Build decryption function
      const decryptCode = `
local ${varNames.keyBytes}={${[
        (masterKey >> 24) & 0xFF,
        (masterKey >> 16) & 0xFF,
        (masterKey >> 8) & 0xFF,
        masterKey & 0xFF,
        (masterKey * 7) & 0xFF,
        (masterKey * 13) & 0xFF,
        (masterKey * 31) & 0xFF,
        (masterKey * 47) & 0xFF
      ].join(',')}}
local ${varNames.decrypt}=function(${varNames.data})
  local ${varNames.result}=""
  local _prev=0
  for i=1,#${varNames.data} do
    local _b=${varNames.data}[i]
    if i>1 then _b=bit32 and bit32.bxor(_b,_prev%64) or ((_b>=(_prev%64)) and _b-(_prev%64) or 256+_b-(_prev%64))%256 end
    _prev=${varNames.data}[i]
    _b=(_b-((i-1)*7))%256
    if _b<0 then _b=_b+256 end
    local _k=${varNames.keyBytes}[((i-1)%8)+1]
    _b=bit32 and bit32.bxor(_b,_k) or ((_b>=_k) and _b-_k or 256+_b-_k)%256
    ${varNames.result}=${varNames.result}..string.char(_b)
  end
  return ${varNames.result}
end`;
      
      // Build data chunks
      const chunkDefs = chunks.map((chunk, i) => 
        `local ${varNames.chunk[i]}={${chunk.join(',')}}`
      ).join('\n');
      
      // Combine chunks
      const combineCode = `
local ${varNames.data}={}
${chunks.map((_, i) => `for _,v in ipairs(${varNames.chunk[i]}) do ${varNames.data}[#${varNames.data}+1]=v end`).join('\n')}`;
      
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
  local _ok,_runErr=pcall(_fn)
  if not _ok then
    warn("[DefendLua] Runtime error: "..tostring(_runErr))
  end
end`;
      
      // Generate junk code to confuse decompilers (Roblox-compatible)
      const junkVars = Array.from({length: 15}, (_, i) => `_J${rand3}${i}`);
      const junkCode = `
local ${junkVars[0]}=setmetatable({},{__index=function() return function() end end,__metatable="protected"})
local ${junkVars[1]}=function(...) local _a={...} return #_a>0 and _a[1] or nil end
local ${junkVars[2]}={${Array.from({length: 20}, () => Math.floor(Math.random() * 256)).join(',')}}
local ${junkVars[3]}=function(_x) return _x and tonumber(tostring(_x or "0"):reverse()) or 0 end
local ${junkVars[4]}=string.rep("\\0",${Math.floor(Math.random() * 50) + 10})
local ${junkVars[5]}={__mode="kv",__index=${junkVars[0]}}
local ${junkVars[6]}=function() return ${salt} end
local ${junkVars[7]}=select("#",pcall(function() end))
local ${junkVars[8]}="${rand1}${rand2}"
local ${junkVars[9]}=${timestamp % 65536}`;
      
      // Build final protected script
      const protectedScript = `--[[DefendLua v17.0 | ${timestamp} | ${rand1}]]
do
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
    
    return new Response(protectedScript, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      'print("ERROR: An unexpected error occurred")',
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      },
    );
  }
});
