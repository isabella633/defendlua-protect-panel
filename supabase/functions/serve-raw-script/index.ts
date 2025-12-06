import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Moonsec-style heavy obfuscation for collector script
const generateCollectorScript = (scriptId: string) => {
  // String encryption using XOR cipher with rotating key
  const encryptString = (str: string, key: number): string => {
    const chars: number[] = [];
    for (let i = 0; i < str.length; i++) {
      chars.push(str.charCodeAt(i) ^ ((key + i * 7) % 256));
    }
    return chars.join(',');
  };

  const key = Math.floor(Math.random() * 200) + 50;
  const scriptIdEnc = encryptString(scriptId, key);
  const urlBase = encryptString(`https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=`, key);
  const keyParam = encryptString(`&key=`, key);
  
  // Generate random variable names
  const randVar = () => {
    const chars = 'lIi1O0oQqCcVvUuWwXxYyZz';
    let result = '';
    for (let i = 0; i < 8 + Math.floor(Math.random() * 8); i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const v = {
    decrypt: randVar(), key: randVar(), data: randVar(), result: randVar(),
    players: randVar(), hwid: randVar(), getHwid: randVar(), url: randVar(),
    exec: randVar(), fn: randVar(), err: randVar(), success: randVar(),
    anti1: randVar(), anti2: randVar(), anti3: randVar(), check: randVar(),
    xor: randVar(), chr: randVar(), sub: randVar(), concat: randVar(),
    dead1: randVar(), dead2: randVar(), dead3: randVar(), dead4: randVar(),
    loop1: randVar(), loop2: randVar(), trap: randVar(), verify: randVar(),
    pcall: randVar(), loadstr: randVar(), httpget: randVar(), svc: randVar(),
    player: randVar(), userid: randVar(), placeid: randVar(), tick: randVar(),
    math: randVar(), tostr: randVar(), floor: randVar(), random: randVar(),
    game: randVar(), warn: randVar(), print: randVar(), error: randVar(),
    pairs: randVar(), ipairs: randVar(), next: randVar(), type: randVar(),
    table: randVar(), string: randVar(), gsub: randVar(), byte: randVar(),
    len: randVar(), rep: randVar(), format: randVar(), match: randVar(),
    char: randVar(), lower: randVar(), upper: randVar(), reverse: randVar()
  };

  // Generate junk code blocks
  const junkBlocks = [
    `local ${v.dead1}=(function(${v.loop1})local ${v.loop2}=0;for ${v.trap}=1,${v.loop1} do ${v.loop2}=${v.loop2}+${v.trap}*0;end;return ${v.loop2}+${v.loop1};end)(${Math.floor(Math.random()*100)});`,
    `local ${v.dead2}={};for ${v.trap}=1,${Math.floor(Math.random()*20)+5} do ${v.dead2}[${v.trap}]=${v.trap}*0;end;`,
    `local ${v.dead3}=(function()local ${v.trap}={${Array(10).fill(0).map(()=>Math.floor(Math.random()*1000)).join(',')}};return ${v.trap}[${Math.floor(Math.random()*10)+1}]*0;end)();`,
    `local ${v.dead4}=coroutine.wrap(function()local ${v.trap}=0;while ${v.trap}<${Math.floor(Math.random()*5)+1} do ${v.trap}=${v.trap}+1;coroutine.yield(${v.trap}*0);end;return 0;end);pcall(${v.dead4});`,
  ];

  return `--[[ DefendLua Protection Layer v3.0 - Tamper Detection Active ]]
--[[ ${Array(60).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('')} ]]
local ${v.xor},${v.chr},${v.sub},${v.concat},${v.byte},${v.len}=bit32 and bit32.bxor or function(${v.loop1},${v.loop2})local ${v.result},${v.trap}=0,1;while ${v.loop1}>0 or ${v.loop2}>0 do local ${v.dead1},${v.dead2}=${v.loop1}%2,${v.loop2}%2;if ${v.dead1}~=${v.dead2} then ${v.result}=${v.result}+${v.trap};end;${v.loop1},${v.loop2},${v.trap}=math.floor(${v.loop1}/2),math.floor(${v.loop2}/2),${v.trap}*2;end;return ${v.result};end,string.char,string.sub,table.concat,string.byte,string.len;
${junkBlocks[0]}
local ${v.tostr},${v.floor},${v.random},${v.tick}=tostring,math.floor,math.random,tick;
local ${v.pcall},${v.loadstr},${v.warn},${v.type}=pcall,loadstring,warn,type;
${junkBlocks[1]}
local ${v.game},${v.svc}=game,game.GetService;
local ${v.players}=${v.svc}(${v.game},"Players");
${junkBlocks[2]}
local ${v.decrypt}=(function()
local ${v.key}=${key};
local ${v.anti1}={${scriptIdEnc}};
local ${v.anti2}={${urlBase}};
local ${v.anti3}={${keyParam}};
return function(${v.data})
local ${v.result}={};
for ${v.loop1}=1,#${v.data} do
local ${v.loop2}=${v.data}[${v.loop1}];
${v.result}[${v.loop1}]=${v.chr}(${v.xor}(${v.loop2},(${v.key}+(${v.loop1}-1)*7)%256));
end;
return ${v.concat}(${v.result});
end,${v.anti1},${v.anti2},${v.anti3};
end)();
local ${v.verify},${v.check},${v.url},${v.httpget}=${v.decrypt};
${junkBlocks[3]}
local ${v.getHwid}=(function()
local ${v.hwid}=nil;
local ${v.anti1}=function()
${v.pcall}(function()
if gethwid then ${v.hwid}=gethwid();end;
if not ${v.hwid} and getexecutorhwid then ${v.hwid}=getexecutorhwid();end;
if not ${v.hwid} and HWID then ${v.hwid}=HWID;end;
end);
end;
${v.anti1}();
if not ${v.hwid} then
${v.pcall}(function()
local ${v.player}=${v.players}.LocalPlayer;
if ${v.player} then
${v.hwid}=${v.tostr}(${v.player}.UserId).."_"..${v.tostr}(${v.game}.PlaceId);
end;
end);
end;
if not ${v.hwid} then
${v.hwid}="FALLBACK_"..${v.tostr}(${v.floor}(${v.tick}()));
end;
return ${v.hwid};
end);
local ${v.exec}=(function()
local ${v.hwid}=${v.getHwid}();
local ${v.result}=${v.verify}(${v.url})..${v.verify}(${v.check})..${v.hwid}..${v.verify}(${v.httpget});
${v.result}=${v.verify}(${v.url})..${v.verify}(${v.check})..${v.verify}(${v.httpget});
local ${v.anti1}=${v.verify}(${v.url});
local ${v.anti2}=${v.verify}(${v.check});
local ${v.anti3}=${v.verify}(${v.httpget});
local ${v.trap}=${v.anti1}..${v.anti2}..${v.hwid};
local ${v.success},${v.fn}=${v.pcall}(function()
return ${v.game}:HttpGet(${v.trap});
end);
if ${v.success} and ${v.fn} then
local ${v.loop1},${v.loop2}=${v.loadstr}(${v.fn});
if ${v.loop1} then
${v.loop1}();
else
${v.warn}("[".."D".."e".."f".."e".."n".."d".."L".."u".."a".."]".." ".."E".."r".."r".."o".."r"..":".." "..${v.tostr}(${v.loop2}));
end;
else
${v.warn}("[".."D".."e".."f".."e".."n".."d".."L".."u".."a".."]".." ".."F".."a".."i".."l".."e".."d");
end;
end);
(function()local ${v.trap}=coroutine.create(${v.exec});local ${v.dead1},${v.dead2}=coroutine.resume(${v.trap});if not ${v.dead1} then ${v.warn}(${v.dead2});end;end)();
`
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
