import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Moonsec/LuArmor-style heavy obfuscation for collector script
const generateCollectorScript = (scriptId: string) => {
  // String encryption using XOR cipher with rotating key
  const encryptString = (str: string, key: number): number[] => {
    const chars: number[] = [];
    for (let i = 0; i < str.length; i++) {
      chars.push(str.charCodeAt(i) ^ ((key + i * 7) % 256));
    }
    return chars;
  };

  const key = Math.floor(Math.random() * 200) + 50;
  const scriptIdEnc = encryptString(scriptId, key);
  const urlBase = encryptString(`https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=`, key);
  const keyParam = encryptString(`&key=`, key);
  
  // Generate random variable names (LuArmor style - mixed Il1O0)
  const randVar = () => {
    const chars = 'Il1O0QqZzXxYyWwVvUuCc';
    let result = chars[Math.floor(Math.random() * 5)]; // Start with letter
    for (let i = 0; i < 10 + Math.floor(Math.random() * 6); i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  // Create all variable names upfront
  const vars: Record<string, string> = {};
  const varNames = [
    'xorFn', 'chrFn', 'concatFn', 'key', 'scriptIdData', 'urlData', 'keyParamData',
    'decryptFn', 'result', 'i', 'v', 'game', 'svc', 'players', 'player',
    'hwid', 'getHwidFn', 'tostr', 'floor', 'tick', 'pcallFn', 'loadstrFn', 
    'warnFn', 'execFn', 'url', 'response', 'success', 'fn', 'err',
    'junk1', 'junk2', 'junk3', 'junk4', 'loop', 'tmp', 'coro'
  ];
  varNames.forEach(name => vars[name] = randVar());

  // Generate junk code that actually runs without errors
  const junk = [
    `local ${vars.junk1}=0;for ${vars.loop}=1,${Math.floor(Math.random()*10)+5} do ${vars.junk1}=${vars.junk1}+(${vars.loop}*0);end;`,
    `local ${vars.junk2}={};for ${vars.loop}=1,${Math.floor(Math.random()*8)+3} do ${vars.junk2}[${vars.loop}]=(${vars.loop}*0);end;`,
    `local ${vars.junk3}=(function()return (${Math.floor(Math.random()*999)}*0);end)();`,
    `local ${vars.junk4}=coroutine.wrap(function()return 0;end);pcall(${vars.junk4});`
  ];

  // Build the obfuscated Lua script
  return `--[[${'='.repeat(40)} DefendLua v3.1 ${'='.repeat(40)}]]
--[[${Array(80).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('')}]]
${junk[0]}
local ${vars.xorFn}=bit32 and bit32.bxor or function(a,b)
local r,p=0,1
while a>0 or b>0 do
local x,y=a%2,b%2
if x~=y then r=r+p end
a,b,p=math.floor(a/2),math.floor(b/2),p*2
end
return r
end
${junk[1]}
local ${vars.chrFn}=string.char
local ${vars.concatFn}=table.concat
local ${vars.tostr}=tostring
local ${vars.floor}=math.floor
local ${vars.tick}=tick or os.clock
local ${vars.pcallFn}=pcall
local ${vars.loadstrFn}=loadstring
local ${vars.warnFn}=warn or print
${junk[2]}
local ${vars.game}=game
local ${vars.svc}=${vars.game}.GetService
local ${vars.players}=${vars.svc}(${vars.game},"Players")
${junk[3]}
local ${vars.key}=${key}
local ${vars.scriptIdData}={${scriptIdEnc.join(',')}}
local ${vars.urlData}={${urlBase.join(',')}}
local ${vars.keyParamData}={${keyParam.join(',')}}
local ${vars.decryptFn}=function(${vars.tmp})
local ${vars.result}={}
for ${vars.i}=1,#${vars.tmp} do
local ${vars.v}=${vars.tmp}[${vars.i}]
${vars.result}[${vars.i}]=${vars.chrFn}(${vars.xorFn}(${vars.v},(${vars.key}+(${vars.i}-1)*7)%256))
end
return ${vars.concatFn}(${vars.result})
end
local ${vars.getHwidFn}=function()
local ${vars.hwid}=nil
${vars.pcallFn}(function()
if gethwid then ${vars.hwid}=gethwid()end
if not ${vars.hwid} and getexecutorhwid then ${vars.hwid}=getexecutorhwid()end
if not ${vars.hwid} and HWID then ${vars.hwid}=HWID end
end)
if not ${vars.hwid} then
${vars.pcallFn}(function()
local ${vars.player}=${vars.players}.LocalPlayer
if ${vars.player} then
${vars.hwid}=${vars.tostr}(${vars.player}.UserId).."_"..${vars.tostr}(${vars.game}.PlaceId)
end
end)
end
if not ${vars.hwid} then
${vars.hwid}="FB_"..${vars.tostr}(${vars.floor}(${vars.tick}()*1000))
end
return ${vars.hwid}
end
local ${vars.execFn}=function()
local ${vars.hwid}=${vars.getHwidFn}()
local ${vars.url}=${vars.decryptFn}(${vars.urlData})..${vars.decryptFn}(${vars.scriptIdData})..${vars.decryptFn}(${vars.keyParamData})..${vars.hwid}
local ${vars.success},${vars.response}=${vars.pcallFn}(function()
return ${vars.game}:HttpGet(${vars.url})
end)
if ${vars.success} and ${vars.response} then
local ${vars.fn},${vars.err}=${vars.loadstrFn}(${vars.response})
if ${vars.fn} then
${vars.fn}()
else
${vars.warnFn}("[DefendLua] Error: "..${vars.tostr}(${vars.err} or "unknown"))
end
else
${vars.warnFn}("[DefendLua] Request failed")
end
end
local ${vars.coro}=coroutine.create(${vars.execFn})
coroutine.resume(${vars.coro})
`;
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
      return new Response('print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: Script ID not provided")', {
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

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get client IP address from request headers
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

    console.log("Request details:", { scriptId, hwid: hwid ? "provided" : "missing", clientIp });

    // Fetch script data
    const { data: script, error } = await supabaseAdmin
      .from("scripts")
      .select("script_key, hwid_list, ip_list, hwid_blacklist, public_access, script_name, owner_id, webhook_url")
      .eq("id", scriptId)
      .single();

    if (error || !script) {
      console.error("Script not found:", error);
      return new Response(
        'print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: Script not found or does not exist")\nprint("This access attempt has been logged")',
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Fetch owner's subscription plan
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

    // Helper function to send Discord webhook
    const sendDiscordWebhook = async (status: string, reason: string, color: number) => {
      if (!webhookUrl || (userPlan !== "pro" && userPlan !== "enterprise")) return;
      
      try {
        const embed = {
          title: `🛡️ DefendLua Access Log`,
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
                label: "🚫 Blacklist this HWID",
                custom_id: `blacklist_${scriptId}_${hwid}`
              }]
            }]
          })
        });
        console.log("Discord webhook sent successfully");
      } catch (webhookError) {
        console.error("Failed to send Discord webhook:", webhookError);
      }
    };

    // Helper function to log access attempts
    const logAccess = async (status: string, reason?: string) => {
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid,
        ip_address: clientIp,
        status,
        reason,
      });

      // Send Discord webhook for Pro/Enterprise users
      const color = status === "allowed" ? 0x00ff00 : 0xff0000; // Green for allowed, red for denied
      await sendDiscordWebhook(status.toUpperCase(), reason || "N/A", color);
    };

    // Check blacklist first (applies to all plans)
    if (hwidBlacklist.includes(hwid)) {
      console.log("Access denied - blacklisted:", { scriptId, hwid, clientIp });
      await logAccess("denied", "HWID blacklisted");
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: HWID has been blacklisted")\nprint("Contact the script owner if you believe this is an error")`,
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Check IP whitelist (applies to all plans)
    const isIpWhitelisted = ipList.length === 0 || ipList.includes(clientIp);
    if (!isIpWhitelisted) {
      console.log("Access denied - IP not authorized:", { scriptId, hwid, clientIp });
      await logAccess("denied", "IP address not authorized");
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: IP address not authorized")\nprint("Contact the script owner to request IP whitelist authorization")`,
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Check if HWID is already whitelisted
    const isHwidWhitelisted = hwidList.includes(hwid);

    // Get HWID limit based on plan
    const getHwidLimit = (plan: string): number => {
      switch (plan) {
        case "free":
          return 10;
        case "pro":
          return 100;
        case "enterprise":
          return 999999; // effectively unlimited
        default:
          return 10;
      }
    };

    const hwidLimit = getHwidLimit(userPlan);
    const currentHwidCount = hwidList.length;

    // For Pro/Enterprise with public access enabled, auto-whitelist new HWIDs
    const isProOrEnterprise = userPlan === "pro" || userPlan === "enterprise";
    if (isProOrEnterprise && publicAccess && !isHwidWhitelisted) {
      // Check HWID limit before auto-whitelisting
      if (currentHwidCount >= hwidLimit) {
        console.log("HWID limit reached - cannot auto-whitelist:", {
          scriptId,
          hwid,
          clientIp,
          plan: userPlan,
          currentCount: currentHwidCount,
          limit: hwidLimit,
        });
        await logAccess("denied", `HWID limit reached (${currentHwidCount}/${hwidLimit})`);
        return new Response(
          `print("⛔ ACCESS DENIED ⛔")\nprint("HWID limit reached for this script")\nprint("Contact the script owner to upgrade their plan or remove unused HWIDs")`,
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "text/plain" },
          },
        );
      }

      console.log("Auto-whitelisting new HWID:", {
        scriptId,
        scriptName: script.script_name,
        hwid,
        clientIp,
        plan: userPlan,
        hwidCount: `${currentHwidCount + 1}/${hwidLimit}`,
      });

      // Add HWID to whitelist
      const updatedHwidList = [...hwidList, hwid];
      await supabaseAdmin.from("scripts").update({ hwid_list: updatedHwidList }).eq("id", scriptId);

      await logAccess("allowed", "Auto-whitelisted (Public Access)");
    } else if (isProOrEnterprise && publicAccess) {
      console.log("Public access granted (already whitelisted):", {
        scriptId,
        scriptName: script.script_name,
        hwid,
        clientIp,
        plan: userPlan,
      });
      await logAccess("allowed", "Public access (already whitelisted)");
    } else if (!isHwidWhitelisted) {
      // For Free plan OR Pro/Enterprise with public access disabled, deny if not whitelisted
      console.log("Access denied - HWID not authorized:", { scriptId, hwid, clientIp, plan: userPlan });
      await logAccess("denied", "HWID not authorized");
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: HWID not authorized")\nprint("Contact the script owner to request HWID authorization")`,
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    } else {
      console.log("Script execution authorized:", {
        scriptId,
        scriptName: script.script_name,
        hwid,
        clientIp,
        plan: userPlan,
      });
      await logAccess("allowed", "HWID whitelisted");
    }

    // Return raw script for Roblox execution only
    return new Response(script.script_key, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        "X-Protected-By": "DefendLua",
      },
    });
  } catch (error) {
    console.error("Error serving raw script:", error);
    return new Response('print("Error: Internal server error")', {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
