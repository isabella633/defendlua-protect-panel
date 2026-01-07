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

    return new Response(script.script_key, {
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
