import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DefendLua Obfuscation Engine v14.0 - Advanced Anti-Tamper Protection
// ═══════════════════════════════════════════════════════════════════════════════

// Generate massive junk code footer to confuse deobfuscators
const generateJunkFooter = (rand: string, rand2: string, rand3: string, fakeVars: string[], salt: number, rot: number): string => {
  const junkFuncs = [];
  const funcNames = Array.from({length: 15}, (_, i) => `_${['xX','Xx','zZ','Zz','yY','Yy','wW','Ww','vV','Vv'][i % 10]}${rand2}${i}`);
  
  // Fake string decryption functions
  junkFuncs.push(`
local ${funcNames[0]}=function(${funcNames[1]},${funcNames[2]})
  local ${funcNames[3]}=""
  for ${funcNames[4]}=1,#${funcNames[1]} do
    local ${funcNames[5]}=string.byte(${funcNames[1]},${funcNames[4]})
    ${funcNames[5]}=(${funcNames[5]}+${funcNames[2]}*${funcNames[4]})%256
    ${funcNames[3]}=${funcNames[3]}..string.char(${funcNames[5]})
  end
  return ${funcNames[3]}
end`);

  // Fake anti-hook detection
  junkFuncs.push(`
local ${funcNames[6]}=function()
  local ${funcNames[7]}={
    ["getrawmetatable"]=true,["setrawmetatable"]=true,
    ["hookfunction"]=true,["hookmetamethod"]=true,
    ["newcclosure"]=true,["checkcaller"]=true
  }
  for ${funcNames[8]},_ in pairs(${funcNames[7]}) do
    if _G[${funcNames[8]}] then
      local ${funcNames[9]}=pcall(function() _G[${funcNames[8]}]() end)
    end
  end
  return ${salt}
end`);

  // Fake table shuffler
  junkFuncs.push(`
local ${funcNames[10]}=function(${funcNames[11]})
  local ${funcNames[12]}=#${funcNames[11]}
  for ${funcNames[13]}=${funcNames[12]},2,-1 do
    local ${funcNames[14]}=math.random(1,${funcNames[13]})
    ${funcNames[11]}[${funcNames[13]}],${funcNames[11]}[${funcNames[14]}]=${funcNames[11]}[${funcNames[14]}],${funcNames[11]}[${funcNames[13]}]
  end
  return ${funcNames[11]}
end`);

  // Fake environment validator
  const envVars = Array.from({length: 8}, (_, i) => `_env${rand3}${i}`);
  junkFuncs.push(`
local ${envVars[0]}=function()
  local ${envVars[1]}={}
  local ${envVars[2]}={"game","workspace","script","_G","shared","_VERSION"}
  for _,${envVars[3]} in ipairs(${envVars[2]}) do
    local ${envVars[4]},${envVars[5]}=pcall(function() return type(rawget(_G,${envVars[3]})) end)
    if ${envVars[4]} then ${envVars[1]}[${envVars[3]}]=${envVars[5]} end
  end
  return next(${envVars[1]})~=nil and ${rot} or 0
end`);

  // Fake bytecode analyzer
  junkFuncs.push(`
local ${envVars[6]}=function(${envVars[7]})
  if type(${envVars[7]})~="function" then return nil end
  local ok,info=pcall(debug.info or function() return {} end,${envVars[7]},"sln")
  if ok and info then
    return tostring(info):sub(1,20)
  end
  return nil
end`);

  // Fake memory scanner
  const memVars = Array.from({length: 6}, (_, i) => `_mem${rand}${i}`);
  junkFuncs.push(`
local ${memVars[0]}=function()
  local ${memVars[1]}=0
  local ${memVars[2]}=collectgarbage and collectgarbage("count") or 0
  for ${memVars[3]}=1,100 do
    local ${memVars[4]}={}
    for ${memVars[5]}=1,${memVars[3]} do ${memVars[4]}[${memVars[5]}]=string.rep("x",${memVars[3]}) end
    ${memVars[1]}=${memVars[1]}+#${memVars[4]}
  end
  return ${memVars[1]}%${salt+1}
end`);

  // Fake recursion trap
  const trapVars = Array.from({length: 5}, (_, i) => `_trap${rand2}${i}`);
  junkFuncs.push(`
local ${trapVars[0]}
${trapVars[0]}=function(${trapVars[1]})
  if ${trapVars[1]}<=0 then return ${rot} end
  if ${trapVars[1]}>${salt} then return ${trapVars[0]}(${trapVars[1]}-1) end
  local ${trapVars[2]}=0
  for ${trapVars[3]}=1,${trapVars[1]} do
    ${trapVars[2]}=(${trapVars[2]}+${trapVars[3]})%256
  end
  return ${trapVars[2]}
end`);

  // Fake opcode confuser
  const opcVars = Array.from({length: 8}, (_, i) => `_opc${rand3}${i}`);
  junkFuncs.push(`
local ${opcVars[0]}={
  [${salt}]=function(a,b) return a+b end,
  [${rot}]=function(a,b) return a-b end,
  [${salt+rot}]=function(a,b) return a*b end,
  [math.abs(${salt}-${rot})]=function(a,b) return b~=0 and a/b or 0 end
}
local ${opcVars[1]}=function(${opcVars[2]},${opcVars[3]},${opcVars[4]})
  local ${opcVars[5]}=${opcVars[0]}[${opcVars[2]}]
  if ${opcVars[5]} then return ${opcVars[5]}(${opcVars[3]},${opcVars[4]}) end
  return 0
end`);

  // Fake VM detection
  const vmVars = Array.from({length: 6}, (_, i) => `_vm${rand}${i}`);
  junkFuncs.push(`
local ${vmVars[0]}=function()
  local ${vmVars[1]}={["Synapse X"]=1,["Script-Ware"]=2,["Krnl"]=3,["Fluxus"]=4,["Electron"]=5}
  local ${vmVars[2]}=identifyexecutor and identifyexecutor() or "Unknown"
  return ${vmVars[1]}[${vmVars[2]}] or 0
end`);

  // Fake call stack analyzer
  const callVars = Array.from({length: 5}, (_, i) => `_call${rand2}${i}`);
  junkFuncs.push(`
local ${callVars[0]}=function()
  local ${callVars[1]}=0
  local ${callVars[2]}=debug and debug.traceback or function() return "" end
  local ${callVars[3]}=${callVars[2]}()
  for _ in string.gmatch(${callVars[3]},"\\n") do ${callVars[1]}=${callVars[1]}+1 end
  return ${callVars[1]}
end`);

  // Fake string obfuscation table
  const strVars = Array.from({length: 4}, (_, i) => `_str${rand3}${i}`);
  junkFuncs.push(`
local ${strVars[0]}={}
for ${strVars[1]}=0,255 do
  ${strVars[0]}[${strVars[1]}]=string.char((${strVars[1]}+${salt})%256)
end
local ${strVars[2]}=function(${strVars[3]})
  local r=""
  for i=1,#${strVars[3]} do r=r..${strVars[0]}[string.byte(${strVars[3]},i)] end
  return r
end`);

  // Dead code that looks important
  const deadCode = `
local _INTERNAL_VER="${rand}_v14.0.${salt}"
local _BUILD_TS=${Date.now()}
local _SIG_CHECK=0x${(salt * rot).toString(16).toUpperCase()}
local _ENV_HASH=${(salt + rot) * 31}
local _ANTI_TAMPER_KEY="${Math.random().toString(36).slice(2, 10)}"
local _CHECKSUM_SALT=${Math.floor(Math.random() * 65536)}
if false then
  for _=1,0 do
    local _dead=function() return nil end
    _dead()
  end
end
do
  local _scope_${rand}={}
  _scope_${rand}.init=false
  _scope_${rand}.verified=false
  _scope_${rand}.hash=0
  if _scope_${rand}.init then
    error("TAMPER_DETECTED_001")
  end
  if _scope_${rand}.verified then
    error("TAMPER_DETECTED_002")
  end
end
do
  local _integrity_${rand2}=function()
    local a,b,c=0,0,0
    for i=1,${salt} do a=(a+i)%256 end
    for i=1,${rot} do b=(b+i*2)%256 end
    c=(a+b)%256
    return c==${(Array.from({length: salt}, (_, i) => i + 1).reduce((a, b) => a + b, 0) % 256 + Array.from({length: rot}, (_, i) => (i + 1) * 2).reduce((a, b) => a + b, 0) % 256) % 256}
  end
  local _check_${rand2}=_integrity_${rand2}()
end`;

  // Fake constant pool
  const constPool = `
local _CONST_POOL_${rand2}={
  [1]=${salt},[2]=${rot},[3]=${salt+rot},[4]=${salt*rot%256},
  ["a"]="${rand}",[5]="${rand2}",[6]="${rand3}",
  [7]=0x${salt.toString(16)},[8]=0x${rot.toString(16)},
  ["_sig"]=function() return ${salt*7+rot*13}%65536 end,
  ["_verify"]=function(x) return (x*${salt}+${rot})%65536 end,
  ["_hash"]=function(s)
    local h=0
    for i=1,#s do h=(h*31+string.byte(s,i))%2147483647 end
    return h
  end
}`;

  // More dead functions
  const deadFuncs = `
local _unused_${rand}=function(a,b,c)
  if not a then return nil end
  if type(b)~="number" then return false end
  local r={}
  for i=1,c or 10 do
    r[i]=(a+b*i)%256
  end
  return r
end
local _fake_decrypt_${rand2}=function(data,key)
  local out=""
  for i=1,#data do
    local byte=string.byte(data,i)
    local k=string.byte(key,((i-1)%#key)+1)
    out=out..string.char(bit32 and bit32.bxor(byte,k) or ((byte>k) and (byte-k) or (256+byte-k)))
  end
  return out
end
local _runtime_check_${rand3}=function()
  local checks={
    game~=nil,
    workspace~=nil,
    typeof~=nil or type~=nil,
    pcall~=nil,
    coroutine~=nil
  }
  for _,v in ipairs(checks) do
    if not v then return false end
  end
  return true
end`;

  return `
--[[FOOTER_${rand}_${Date.now()}]]
${junkFuncs.join('\n')}
${deadCode}
${constPool}
${deadFuncs}
--[[INTEGRITY_SIG_${Math.random().toString(36).slice(2, 14)}]]
--[[BUILD_${Date.now()}_${salt}_${rot}]]
--[[END_DL14]]`;
};

const generateCollectorScript = (scriptId: string): string => {
  const url = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=${scriptId}&key=`;
  
  // Multi-layer encryption keys
  const xorKey = Math.floor(Math.random() * 50) + 10;
  const saltKey = Math.floor(Math.random() * 30) + 5;
  const rotKey = Math.floor(Math.random() * 15) + 3;
  
  // XOR encrypt string
  const xorEnc = (str: string): number[] => {
    const r: number[] = [];
    for (let i = 0; i < str.length; i++) {
      r.push(str.charCodeAt(i) ^ xorKey);
    }
    return r;
  };
  
  const encUrl = xorEnc(url);
  const rand = Math.random().toString(36).slice(2, 8);
  const rand2 = Math.random().toString(36).slice(2, 6);
  const rand3 = Math.random().toString(36).slice(2, 5);
  const ts = Date.now().toString(36);
  
  // Generate fake variable names (look-alike chars: O0, l1, I1)
  const fakeVars = Array.from({length: 20}, (_, i) => 
    `_${['O0','l1','I1','oO','lI','Il','Ol','IO','OI','i1'][i % 10]}${rand3}${i}`
  );
  
  // Real variable names (disguised to look like fake ones)
  const v = {
    d: `_O0O${rand}`,
    k: `_l1l${rand}`,
    s: `_I1I${rand}`,
    h: `_oOo${rand}`,
    u: `_lIl${rand}`,
    r: `_IlI${rand}`,
    f: `_OlO${rand}`,
    g: `_IOI${rand}`,
    p: `_OIO${rand}`,
    l: `_i1i${rand}`,
    t: `_0O0${rand}`,
    m: `_1l1${rand}`,
    n: `_1I1${rand}`,
    q: `_oO0${rand}`,
    z: `_lI1${rand}`,
  };

  // Anti-tamper hash seed
  const antiTamperSeed = Math.floor(Math.random() * 99999) + 10000;
  const checksum = (antiTamperSeed * 7 + 13) % 65536;
  
  // Generate junk math operations (appears to be important calculations)
  const junkOps = [
    `local ${fakeVars[0]}=(${saltKey}*${rotKey}+${antiTamperSeed%100})%256`,
    `local ${fakeVars[1]}=${fakeVars[0]}~=${saltKey} and ${rotKey} or ${saltKey+rotKey}`,
    `local ${fakeVars[2]}=function(a,b) return (a+b)*(a-b)%256 end`,
    `local ${fakeVars[3]}=${fakeVars[2]}(${saltKey},${rotKey})`,
    `local ${fakeVars[4]}=function() return ${fakeVars[3]}*2 end`,
    `local ${fakeVars[5]}=${antiTamperSeed}%1000`,
    `local ${fakeVars[6]}=tonumber("${(antiTamperSeed % 256).toString(16)}", 16) or 0`,
  ];

  // Fake anti-debug functions
  const antiDebugCode = `
local ${fakeVars[7]}=function(${fakeVars[8]})
  local ${fakeVars[9]}=0
  for ${fakeVars[10]}=1,#${fakeVars[8]} do
    ${fakeVars[9]}=(${fakeVars[9]}+string.byte(${fakeVars[8]},${fakeVars[10]})*${fakeVars[10]})%65536
  end
  return ${fakeVars[9]}
end
local ${fakeVars[11]}=function()
  local ${fakeVars[12]}=os and os.clock or tick or function() return 0 end
  local ${fakeVars[13]}=${fakeVars[12]}()
  for ${fakeVars[14]}=1,1000 do local _=math.random() end
  return (${fakeVars[12]}()-${fakeVars[13]})<0.1
end
local ${fakeVars[15]}=${fakeVars[11]}()`;

  // Fake integrity verification
  const integrityCheck = `
local ${v.t}=${antiTamperSeed}
local ${v.m}=${checksum}
local ${v.n}=function(${fakeVars[16]})
  local ${fakeVars[17]}=${v.t}
  for ${fakeVars[18]}=1,#${fakeVars[16]} do
    ${fakeVars[17]}=(${fakeVars[17]}*31+string.byte(${fakeVars[16]},${fakeVars[18]}))%2147483647
  end
  return ${fakeVars[17]}%65536==${v.m}
end`;

  // Environment confusion
  const envConfusion = `
local ${v.q}=_G or _ENV or {}
local ${v.z}=getfenv and getfenv(0) or ${v.q}
pcall(function() ${v.z}["_${rand2}"]=function() return nil end end)`;

  const script = `--[[DL14_${rand}_${ts}]]
${junkOps.join('\n')}
${antiDebugCode}
${integrityCheck}
${envConfusion}
local ${v.d}={${encUrl.join(',')}}
local ${v.k}=${xorKey}
local ${v.s}=""
for i=1,#${v.d} do
  local c=${v.d}[i]
  local x=c
  for j=1,${v.k} do x=(x+1)%256 if x==c then break end end
  x=c
  local b=0
  while b<256 do
    if (b+${v.k})%256==0 then break end
    b=b+1
  end
  ${v.s}=${v.s}..string.char(bit32 and bit32.bxor(c,${v.k}) or ((c>${v.k}) and (c-${v.k}) or (256+c-${v.k})))
end
local ${v.h}=nil
pcall(function()
  if gethwid then ${v.h}=gethwid() end
  if not ${v.h} and getexecutorhwid then ${v.h}=getexecutorhwid() end
  if not ${v.h} and get_hwid then ${v.h}=get_hwid() end
  if not ${v.h} and syn and syn.hwid then ${v.h}=syn.hwid() end
  if not ${v.h} and fluxus and fluxus.GetHWID then ${v.h}=fluxus:GetHWID() end
  if not ${v.h} and identifyexecutor then
    local ok,name=pcall(identifyexecutor)
    if ok and name then ${v.h}=name.."_"..tostring(math.floor(tick()*1000)) end
  end
end)
if not ${v.h} then
  pcall(function()
    local ${v.g}=game
    local ${v.p}=${v.g}:GetService("Players")
    local ${v.l}=${v.p}.LocalPlayer
    if ${v.l} then
      ${v.h}=tostring(${v.l}.UserId).."_"..tostring(${v.g}.PlaceId).."_"..tostring(${v.g}.GameId)
    end
  end)
end
if not ${v.h} then
  ${v.h}="DL_"..tostring(math.floor(tick()*100000)).."_"..tostring(math.random(100000,999999))
end
local ${v.u}=${v.s}..${v.h}
local ${v.r}=nil
pcall(function()
  ${v.r}=game:HttpGet(${v.u})
end)
if ${v.r} and #${v.r}>10 then
  local ${v.f}=nil
  pcall(function()
    ${v.f}=(loadstring or load)(${v.r})
  end)
  if ${v.f} and type(${v.f})=="function" then
    pcall(${v.f})
  end
end
${generateJunkFooter(rand, rand2, rand3, fakeVars, saltKey, rotKey)}
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
