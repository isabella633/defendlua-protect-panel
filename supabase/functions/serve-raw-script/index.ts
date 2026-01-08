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

// Main collector script generator - simplified for reliability
const generateCollectorScript = (scriptId: string): string => {
  const baseUrl = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=${scriptId}&key=`;
  
  // Generate unique identifiers for variable obfuscation
  const rand = Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36);
  
  // Simple XOR key for URL encoding
  const xorKey = Math.floor(Math.random() * 50) + 50;
  
  // Encode URL bytes
  const encUrl: number[] = [];
  for (let i = 0; i < baseUrl.length; i++) {
    encUrl.push(baseUrl.charCodeAt(i) ^ xorKey);
  }
  
  // Variable names
  const v = {
    url: `_u${rand}`,
    hwid: `_h${rand}`,
    res: `_r${rand}`,
    fn: `_f${rand}`,
    dec: `_d${rand}`,
    enc: `_e${rand}`,
    key: `_k${rand}`,
  };

  const script = `--[[DefendLua_${ts}]]
local ${v.enc}={${encUrl.join(',')}}
local ${v.key}=${xorKey}
local ${v.dec}=function(t,k)
  local s=""
  for i=1,#t do
    local c=t[i]
    local x=0
    if bit32 then
      x=bit32.bxor(c,k)
    else
      local r,p=0,1
      local a,b=c,k
      for _=1,8 do
        if a%2~=b%2 then r=r+p end
        a=math.floor(a/2)
        b=math.floor(b/2)
        p=p*2
      end
      x=r
    end
    s=s..string.char(x)
  end
  return s
end
local ${v.url}=${v.dec}(${v.enc},${v.key})
local ${v.hwid}=nil
local function getHwid()
  if gethwid then return gethwid() end
  if getexecutorhwid then return getexecutorhwid() end
  if get_hwid then return get_hwid() end
  if syn and syn.hwid then return syn.hwid() end
  if fluxus and fluxus.GetHWID then return fluxus.GetHWID() end
  if identifyexecutor then
    local ok,name=pcall(identifyexecutor)
    if ok and name then return name.."_"..tostring(math.floor(tick()*1000)) end
  end
  if game and game.Players and game.Players.LocalPlayer then
    local p=game.Players.LocalPlayer
    return tostring(p.UserId).."_"..tostring(game.PlaceId).."_"..tostring(game.GameId)
  end
  return "DL_"..tostring(math.floor(tick()*100000)).."_"..tostring(math.random(100000,999999))
end
${v.hwid}=getHwid()
local ${v.res}=nil
local ok,err=pcall(function()
  if game and game.HttpGet then
    ${v.res}=game:HttpGet(${v.url}..${v.hwid})
  elseif syn and syn.request then
    local r=syn.request({Url=${v.url}..${v.hwid},Method="GET"})
    if r and r.Body then ${v.res}=r.Body end
  elseif request then
    local r=request({Url=${v.url}..${v.hwid},Method="GET"})
    if r and r.Body then ${v.res}=r.Body end
  elseif http_request then
    local r=http_request({Url=${v.url}..${v.hwid},Method="GET"})
    if r and r.Body then ${v.res}=r.Body end
  elseif HttpGet then
    ${v.res}=HttpGet(${v.url}..${v.hwid})
  end
end)
if not ok then
  warn("[DefendLua] HTTP Error: "..tostring(err))
end
if ${v.res} and #${v.res}>10 then
  if ${v.res}:sub(1,5)=="print" or ${v.res}:sub(1,4)=="warn" or ${v.res}:sub(1,5)=="error" then
    local ${v.fn},loadErr=loadstring(${v.res})
    if ${v.fn} then
      local runOk,runErr=pcall(${v.fn})
      if not runOk then
        warn("[DefendLua] Execution Error: "..tostring(runErr))
      end
    else
      warn("[DefendLua] Load Error: "..tostring(loadErr))
    end
  else
    local ${v.fn},loadErr=loadstring(${v.res})
    if ${v.fn} then
      local runOk,runErr=pcall(${v.fn})
      if not runOk then
        warn("[DefendLua] Execution Error: "..tostring(runErr))
      end
    else
      warn("[DefendLua] Load Error: "..tostring(loadErr))
    end
  end
elseif ${v.res} then
  warn("[DefendLua] Access Denied: "..${v.res})
else
  warn("[DefendLua] No response received")
end
`;

  return script;
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
    // DEFENDLUA VM OBFUSCATOR v18 - Virtual Machine Based Protection
    // ═══════════════════════════════════════════════════════════════════════════════
    
    const obfuscateScript = (source: string, hwid: string): string => {
      const ts = Date.now();
      const r1 = Math.random().toString(36).slice(2, 8);
      const r2 = Math.random().toString(36).slice(2, 8);
      const r3 = Math.random().toString(36).slice(2, 8);
      const r4 = Math.random().toString(36).slice(2, 8);
      const seed = Math.floor(Math.random() * 0xFFFFFF);
      
      // Generate unique opcodes for this instance (randomized instruction set)
      const opcodes = {
        LOAD_BYTE: Math.floor(Math.random() * 50) + 1,
        XOR_KEY: Math.floor(Math.random() * 50) + 51,
        ADD_POS: Math.floor(Math.random() * 50) + 101,
        SUB_PREV: Math.floor(Math.random() * 50) + 151,
        EMIT_CHAR: Math.floor(Math.random() * 50) + 201,
        END: 0
      };
      
      // Multi-layer encryption with random keys
      const keys = Array.from({length: 16}, () => Math.floor(Math.random() * 256));
      const iv = Array.from({length: 8}, () => Math.floor(Math.random() * 256));
      
      // Encrypt source with cascading cipher
      const encrypt = (src: string): number[] => {
        const out: number[] = [];
        let state = seed;
        for (let i = 0; i < src.length; i++) {
          let b = src.charCodeAt(i);
          // Layer 1: XOR with key schedule
          b ^= keys[i % keys.length];
          // Layer 2: Add IV rotation
          b = (b + iv[i % iv.length]) & 0xFF;
          // Layer 3: XOR with state
          b ^= (state & 0xFF);
          // Layer 4: Position scramble
          b = (b + (i * 13)) & 0xFF;
          // Layer 5: Feedback from previous
          if (out.length > 0) b ^= out[out.length - 1] >> 2;
          // Update state
          state = (state * 1103515245 + 12345) >>> 0;
          out.push(b);
        }
        return out;
      };
      
      const encrypted = encrypt(source);
      
      // Generate VM bytecode for decryption (makes static analysis much harder)
      const generateBytecode = (): number[] => {
        const bc: number[] = [];
        for (let i = 0; i < encrypted.length; i++) {
          // Randomize instruction order per byte
          const order = Math.floor(Math.random() * 6);
          bc.push(opcodes.LOAD_BYTE, encrypted[i]);
          if (order < 2) {
            bc.push(opcodes.XOR_KEY, keys[i % keys.length]);
            bc.push(opcodes.SUB_PREV, iv[i % iv.length]);
          } else if (order < 4) {
            bc.push(opcodes.SUB_PREV, iv[i % iv.length]);
            bc.push(opcodes.XOR_KEY, keys[i % keys.length]);
          } else {
            bc.push(opcodes.ADD_POS, (i * 13) & 0xFF);
            bc.push(opcodes.XOR_KEY, keys[i % keys.length]);
          }
          bc.push(opcodes.EMIT_CHAR, i & 0xFF);
        }
        bc.push(opcodes.END);
        return bc;
      };
      
      const bytecode = generateBytecode();
      
      // Split bytecode into scattered arrays
      const numChunks = 8;
      const chunkSize = Math.ceil(bytecode.length / numChunks);
      const chunks = Array.from({length: numChunks}, (_, i) => 
        bytecode.slice(i * chunkSize, (i + 1) * chunkSize)
      );
      
      // Shuffle chunk order and create reassembly map
      const shuffleOrder = Array.from({length: numChunks}, (_, i) => i);
      for (let i = shuffleOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffleOrder[i], shuffleOrder[j]] = [shuffleOrder[j], shuffleOrder[i]];
      }
      
      // Variable names (heavily obfuscated)
      const v = {
        vm: `_${r1}`,
        bc: `_${r2}`,
        out: `_${r3}`,
        run: `_${r4}`,
        chunks: chunks.map((_, i) => `_${r1}${r2}${i}`),
        keys: `_K${r3}`,
        iv: `_I${r4}`,
        state: `_S${r1}`,
        ops: `_O${r2}`,
        pc: `_P${r3}`,
        reg: `_R${r4}`,
        prev: `_V${r1}`,
        tmp: `_T${r2}`,
        dec: `_D${r3}`,
        exec: `_E${r4}`,
        guard: `_G${r1}`,
        hc: `_H${r2}`,
        ic: `_C${r3}`,
      };
      
      // HWID hash for binding
      const hwidHash = hwid.split('').reduce((a, c, i) => (a * 41 + c.charCodeAt(0) + i) >>> 0, seed);
      
      // Integrity hash of bytecode
      const intHash = bytecode.reduce((a, b, i) => (a * 37 + b + i) >>> 0, seed);
      
      // Build the protected script with embedded VM
      const protectedScript = `--[[DL18|${ts}]]
local ${v.guard}=(function()
local _f=false
if _G["DEOBF"]or _G["DEBUG"]or _G["UNLUAC"]or _G["dump"]then _f=true end
if getgenv and getgenv()["__DL_BLOCK"]then _f=true end
return not _f
end)()
if not ${v.guard}then return end
local ${v.hc}=(function()
local _h=nil
pcall(function()
if gethwid then _h=gethwid()
elseif getexecutorhwid then _h=getexecutorhwid()
elseif get_hwid then _h=get_hwid()
elseif syn then _h=syn.hwid()
elseif fluxus then _h=fluxus.GetHWID()end
end)
if not _h then return true end
local _r=${seed}
for i=1,#_h do _r=(_r*41+string.byte(_h,i)+i-1)%4294967296 end
return _r==${hwidHash}
end)()
if not ${v.hc}then warn("[DL] HWID")return end
local ${v.chunks[shuffleOrder[0]]}={${chunks[shuffleOrder[0]].join(',')}}
local ${v.chunks[shuffleOrder[1]]}={${chunks[shuffleOrder[1]].join(',')}}
local ${v.chunks[shuffleOrder[2]]}={${chunks[shuffleOrder[2]].join(',')}}
local ${v.chunks[shuffleOrder[3]]}={${chunks[shuffleOrder[3]].join(',')}}
local ${v.chunks[shuffleOrder[4]]}={${chunks[shuffleOrder[4]].join(',')}}
local ${v.chunks[shuffleOrder[5]]}={${chunks[shuffleOrder[5]].join(',')}}
local ${v.chunks[shuffleOrder[6]]}={${chunks[shuffleOrder[6]].join(',')}}
local ${v.chunks[shuffleOrder[7]]}={${chunks[shuffleOrder[7]].join(',')}}
local ${v.bc}={}
for _,_v in ipairs(${v.chunks[0]})do ${v.bc}[#${v.bc}+1]=_v end
for _,_v in ipairs(${v.chunks[1]})do ${v.bc}[#${v.bc}+1]=_v end
for _,_v in ipairs(${v.chunks[2]})do ${v.bc}[#${v.bc}+1]=_v end
for _,_v in ipairs(${v.chunks[3]})do ${v.bc}[#${v.bc}+1]=_v end
for _,_v in ipairs(${v.chunks[4]})do ${v.bc}[#${v.bc}+1]=_v end
for _,_v in ipairs(${v.chunks[5]})do ${v.bc}[#${v.bc}+1]=_v end
for _,_v in ipairs(${v.chunks[6]})do ${v.bc}[#${v.bc}+1]=_v end
for _,_v in ipairs(${v.chunks[7]})do ${v.bc}[#${v.bc}+1]=_v end
local ${v.ic}=(function()
local _h=${seed}
for i=1,#${v.bc}do _h=(_h*37+${v.bc}[i]+i-1)%4294967296 end
return _h==${intHash}
end)()
if not ${v.ic}then warn("[DL] INT")return end
local ${v.keys}={${keys.join(',')}}
local ${v.iv}={${iv.join(',')}}
local ${v.ops}={LD=${opcodes.LOAD_BYTE},XK=${opcodes.XOR_KEY},AP=${opcodes.ADD_POS},SP=${opcodes.SUB_PREV},EM=${opcodes.EMIT_CHAR},EN=${opcodes.END}}
local ${v.state}=${seed}
local ${v.vm}=function()
local ${v.out}={}
local ${v.pc}=1
local ${v.reg}=0
local ${v.prev}=0
local ${v.tmp}=0
local _xor=function(a,b)
if bit32 then return bit32.bxor(a,b)end
local r,p=0,1
for _=1,8 do
if a%2~=b%2 then r=r+p end
a=math.floor(a/2)b=math.floor(b/2)p=p*2
end
return r
end
while ${v.pc}<=#${v.bc}do
local op=${v.bc}[${v.pc}]
if op==${v.ops}.EN then break
elseif op==${v.ops}.LD then
${v.pc}=${v.pc}+1
${v.reg}=${v.bc}[${v.pc}]
elseif op==${v.ops}.XK then
${v.pc}=${v.pc}+1
local ki=${v.bc}[${v.pc}]
${v.reg}=_xor(${v.reg},ki)
elseif op==${v.ops}.AP then
${v.pc}=${v.pc}+1
local pi=${v.bc}[${v.pc}]
${v.reg}=(${v.reg}-pi)%256
if ${v.reg}<0 then ${v.reg}=${v.reg}+256 end
elseif op==${v.ops}.SP then
${v.pc}=${v.pc}+1
local si=${v.bc}[${v.pc}]
${v.reg}=(${v.reg}-si)%256
if ${v.reg}<0 then ${v.reg}=${v.reg}+256 end
elseif op==${v.ops}.EM then
${v.pc}=${v.pc}+1
local idx=${v.bc}[${v.pc}]
local fb=0
if #${v.out}>0 then fb=math.floor(string.byte(${v.out}[#${v.out}])/4)end
${v.reg}=_xor(${v.reg},fb)
${v.reg}=_xor(${v.reg},(${v.state}%256))
${v.state}=(${v.state}*1103515245+12345)%4294967296
${v.reg}=(${v.reg}-${v.iv}[(idx%8)+1])%256
if ${v.reg}<0 then ${v.reg}=${v.reg}+256 end
${v.reg}=_xor(${v.reg},${v.keys}[(idx%16)+1])
${v.out}[#${v.out}+1]=string.char(${v.reg})
end
${v.pc}=${v.pc}+1
end
return table.concat(${v.out})
end
local ${v.dec}=${v.vm}()
if not ${v.dec}or #${v.dec}<3 then warn("[DL] DEC")return end
local ${v.exec},_e=loadstring(${v.dec})
if not ${v.exec}then warn("[DL] LD: "..tostring(_e))return end
local _ok,_re=pcall(${v.exec})
if not _ok then warn("[DL] RUN: "..tostring(_re))end
`;
      
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
