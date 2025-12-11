import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DefendLua Obfuscation Engine v11.0 - Reliable Protection
// ═══════════════════════════════════════════════════════════════════════════════

const generateCollectorScript = (scriptId: string): string => {
  const usedNames = new Set<string>();
  
  const generateName = (minLen = 12, maxLen = 20): string => {
    const chars = ['I', 'l', '1', 'O', '0', '_'];
    const prefixes = ['_', '__', 'l', 'I', 'O', '_l', 'll', 'II'];
    let name: string;
    let attempts = 0;
    do {
      const length = minLen + Math.floor(Math.random() * (maxLen - minLen));
      name = prefixes[Math.floor(Math.random() * prefixes.length)];
      while (name.length < length) {
        name += chars[Math.floor(Math.random() * chars.length)];
      }
      name += '_' + Math.floor(Math.random() * 9999).toString(36);
      attempts++;
    } while (usedNames.has(name) && attempts < 50);
    usedNames.add(name);
    return name;
  };

  // Generate encryption key
  const key = Math.floor(Math.random() * 200) + 50;
  
  // Simple XOR encryption
  const encrypt = (str: string): number[] => {
    const result: number[] = [];
    for (let i = 0; i < str.length; i++) {
      result.push(str.charCodeAt(i) ^ ((key + i * 7) % 256));
    }
    return result;
  };
  
  const url = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=${scriptId}&key=`;
  const encryptedUrl = encrypt(url);
  
  // Variable names
  const v: Record<string, string> = {};
  const vars = ['bxor', 'chr', 'byte', 'sub', 'cat', 'floor', 'pcall', 'load', 'type', 
    'tick', 'tostr', 'game', 'plrs', 'key', 'decrypt', 'url', 'data', 'hwid', 
    'res', 'fn', 'lp', 'uid', 'pid', 'jid', 'gid', 't1', 't2', 't3'];
  vars.forEach(name => v[name] = generateName());
  
  // Junk code generator
  const junk = (): string => {
    const jv = generateName(8, 12);
    const templates = [
      `local ${jv}=${Math.floor(Math.random() * 99999)}`,
      `local ${jv}=nil`,
      `local ${jv}={}`,
      `if false then local ${jv}=1 end`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  };
  
  const junkLines = (n: number): string => Array(n).fill(0).map(() => junk()).join('\n');

  const script = `--[[DefendLua Protected v11]]
${junkLines(3)}
local ${v.bxor}=bit32 and bit32.bxor or function(a,b)
local c,d=0,1
while a>0 or b>0 do
local e,f=a%2,b%2
if e~=f then c=c+d end
a,b,d=math.floor(a/2),math.floor(b/2),d*2
end
return c
end
${junkLines(2)}
local ${v.chr}=string.char
local ${v.byte}=string.byte
local ${v.sub}=string.sub
local ${v.cat}=table.concat
local ${v.floor}=math.floor
local ${v.pcall}=pcall
local ${v.load}=loadstring or load
local ${v.type}=type
local ${v.tick}=tick or os.clock
local ${v.tostr}=tostring
${junkLines(2)}
local ${v.game}=game
local ${v.plrs}=${v.game}:GetService("Players")
${junkLines(1)}
local ${v.key}=${key}
local ${v.data}={${encryptedUrl.join(',')}}
${junkLines(2)}
local ${v.decrypt}=function(${v.t1})
local ${v.t2}={}
for ${v.t3}=1,#${v.t1} do
${v.t2}[${v.t3}]=${v.chr}(${v.bxor}(${v.t1}[${v.t3}],(${v.key}+(${v.t3}-1)*7)%256))
end
return ${v.cat}(${v.t2})
end
${junkLines(2)}
local ${v.hwid}=nil
${v.pcall}(function()
if gethwid then ${v.hwid}=gethwid()end
if not ${v.hwid} and getexecutorhwid then ${v.hwid}=getexecutorhwid()end
if not ${v.hwid} and get_hwid then ${v.hwid}=get_hwid()end
if not ${v.hwid} and identifyexecutor then
local ok,name=${v.pcall}(identifyexecutor)
if ok and name then ${v.hwid}=name..${v.tostr}(${v.floor}(${v.tick}()*1000))end
end
if not ${v.hwid} and HWID then ${v.hwid}=HWID end
if not ${v.hwid} and syn then ${v.pcall}(function()${v.hwid}=syn.hwid()end)end
if not ${v.hwid} and fluxus then ${v.pcall}(function()${v.hwid}=fluxus:GetHWID()end)end
if not ${v.hwid} and Cryptic then ${v.pcall}(function()${v.hwid}=Cryptic:GetHWID()end)end
end)
${junkLines(1)}
if not ${v.hwid} then
${v.pcall}(function()
local ${v.lp}=${v.plrs}.LocalPlayer
if ${v.lp} then
local ${v.uid}=${v.tostr}(${v.lp}.UserId)
local ${v.pid}=${v.tostr}(${v.game}.PlaceId)
local ${v.jid}=${v.sub}(${v.tostr}(${v.game}.JobId),1,8)
local ${v.gid}=${v.tostr}(${v.game}.GameId)
${v.hwid}=${v.uid}.."_"..${v.pid}.."_"..${v.jid}.."_"..${v.gid}
end
end)
end
${junkLines(1)}
if not ${v.hwid} then
${v.hwid}="DL_"..${v.tostr}(${v.floor}(${v.tick}()*100000)).."_"..${v.tostr}(math.random(100000,999999))
end
${junkLines(2)}
local ${v.url}=${v.decrypt}(${v.data})..${v.hwid}
${junkLines(1)}
local ${v.res}=nil
${v.pcall}(function()
${v.res}=${v.game}:HttpGet(${v.url})
end)
${junkLines(1)}
if ${v.res} and #${v.res}>10 then
local ${v.fn}=nil
${v.pcall}(function()
${v.fn}=${v.load}(${v.res})
end)
if ${v.fn} and ${v.type}(${v.fn})=="function" then
${v.pcall}(${v.fn})
end
end
${junkLines(3)}
`;

  return script;
};
Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
