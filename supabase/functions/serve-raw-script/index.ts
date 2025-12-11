import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DefendLua Obfuscation Engine v12.0 - Maximum Annoyance Protection
// Features: Random nonsense vars, dead code, over-nesting, XOR strings, 
// inline functions, math-based control flow
// ═══════════════════════════════════════════════════════════════════════════════

const generateCollectorScript = (scriptId: string): string => {
  const usedNames = new Set<string>();
  
  // Ultra-confusing variable name generator
  const genVar = (minLen = 15, maxLen = 25): string => {
    const confuse = ['l', 'I', '1', 'O', '0', 'o', '_', 'Il', 'lI', 'O0', '0O'];
    const prefixes = ['_', '__', '___', 'l', 'I', 'O', '_l', '_I', 'll', 'II', 'OO', 
      'lIl', 'IlI', 'O0O', '_lI', '_Il', 'l1l', 'I1I', '_O0', 'lll', 'III'];
    let name: string;
    let attempts = 0;
    do {
      const length = minLen + Math.floor(Math.random() * (maxLen - minLen));
      name = prefixes[Math.floor(Math.random() * prefixes.length)];
      while (name.length < length) {
        name += confuse[Math.floor(Math.random() * confuse.length)];
      }
      name += Math.floor(Math.random() * 99999).toString(36);
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    usedNames.add(name);
    return name;
  };

  // XOR key - different each generation
  const xorKey = Math.floor(Math.random() * 150) + 50;
  const xorKey2 = Math.floor(Math.random() * 100) + 25;
  
  // XOR encrypt string
  const xorEnc = (str: string): number[] => {
    const r: number[] = [];
    for (let i = 0; i < str.length; i++) {
      r.push(str.charCodeAt(i) ^ ((xorKey + i * xorKey2) % 256));
    }
    return r;
  };
  
  const url = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=${scriptId}&key=`;
  const encUrl = xorEnc(url);
  
  // Math constants for control flow obfuscation
  const mathA = Math.floor(Math.random() * 10000) + 1000;
  const mathB = Math.floor(Math.random() * 100) + 10;
  const mathC = (mathA * mathB) % 997;
  const mathD = (mathA + mathB) % 503;
  const mathE = (mathA * 2 + 1) % 251;
  
  // Generate lots of variables
  const v: Record<string, string> = {};
  const varList = [
    'xor', 'chr', 'byte', 'sub', 'cat', 'flr', 'pcl', 'ld', 'typ', 'tck', 'tstr', 'tnum',
    'gm', 'pl', 'k1', 'k2', 'd', 'dec', 'hw', 'ur', 'rs', 'fn', 'lp', 'ui', 'pi', 'ji', 'gi',
    'a', 'b', 'c', 'e', 'f', 'g', 'h', 'i', 'j', 'm', 'n', 'p', 'q', 'r', 's', 'w', 'x', 'y', 'z',
    'ma', 'mb', 'mc', 'md', 'me', 'cf', 'nst', 'wrp', 'inv',
    ...Array.from({length: 30}, (_, i) => `t${i}`),
    ...Array.from({length: 20}, (_, i) => `jnk${i}`)
  ];
  varList.forEach(name => v[name] = genVar());

  // Dead code generator - runs but does nothing useful
  const deadCode = (): string => {
    const dv1 = genVar(8, 12);
    const dv2 = genVar(8, 12);
    const dv3 = genVar(8, 12);
    const n1 = Math.floor(Math.random() * 999999);
    const n2 = Math.floor(Math.random() * 50) + 5;
    const templates = [
      `if (${n1}%2==0) then local ${dv1}=0 for ${dv2}=1,${n2} do ${dv1}=${dv1}+${dv2} end end`,
      `do local ${dv1}={} for ${dv2}=1,${n2} do ${dv1}[${dv2}]=${dv2}*${n2} end end`,
      `local ${dv1}=(function(${dv2})local ${dv3}=0 for _=1,${n2} do ${dv3}=${dv3}+1 end return ${dv3} end)(${n1})`,
      `repeat local ${dv1}=${n1} ${dv1}=${dv1}+1 until true`,
      `for ${dv1}=1,1 do local ${dv2}=${n1}*0 end`,
      `if ${n1}>999999999 then local ${dv1}=${n2} end`,
      `local ${dv1}=(${n1}*0)+(${n2}*0)+0`,
      `do local ${dv1}=nil local ${dv2}=nil if ${dv1}==nil then ${dv2}=${n1} end end`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  };
  
  const deadBlock = (n: number): string => Array(n).fill(0).map(() => deadCode()).join('\n');
  
  // Inline wrapper generator
  const wrapCall = (call: string): string => {
    const wv = genVar(10, 15);
    return `(function(${wv})return ${wv}()end)(function()return ${call} end)`;
  };
  
  // Over-nested structure
  const nest = (code: string, depth: number = 2): string => {
    let result = code;
    for (let i = 0; i < depth; i++) {
      const nv = genVar(8, 12);
      result = `do local ${nv}=1 repeat if ${nv}==1 then\n${result}\nend ${nv}=${nv}+1 until ${nv}>1 end`;
    }
    return result;
  };

  const script = `--[=[DL_v12_${Math.random().toString(36).slice(2)}]=]
${deadBlock(5)}
local ${v.xor}=bit32 and bit32.bxor or(function()
${deadBlock(2)}
return function(${v.a},${v.b})
local ${v.c},${v.e}=0,1
${deadBlock(1)}
while ${v.a}>0 or ${v.b}>0 do
local ${v.f},${v.g}=${v.a}%2,${v.b}%2
if ${v.f}~=${v.g} then ${v.c}=${v.c}+${v.e} end
${v.a},${v.b},${v.e}=math.floor(${v.a}/2),math.floor(${v.b}/2),${v.e}*2
end
return ${v.c}
end
end)()
${deadBlock(3)}
local ${v.chr}=(function(${v.t0})return ${v.t0}.char end)(string)
local ${v.byte}=(function(${v.t1})return ${v.t1}.byte end)(string)
local ${v.sub}=(function(${v.t2})return ${v.t2}.sub end)(string)
local ${v.cat}=(function(${v.t3})return ${v.t3}.concat end)(table)
local ${v.flr}=(function(${v.t4})return ${v.t4}.floor end)(math)
local ${v.pcl}=(function()return pcall end)()
local ${v.ld}=(function()return loadstring or load end)()
local ${v.typ}=(function()return type end)()
local ${v.tck}=(function()return tick or os.clock end)()
local ${v.tstr}=(function()return tostring end)()
local ${v.tnum}=(function()return tonumber end)()
${deadBlock(4)}
local ${v.gm}=(function(${v.t5})
${deadBlock(1)}
return ${v.t5}
end)(game)
local ${v.pl}=(function(${v.t6})
${deadBlock(1)}
return ${v.t6}:GetService("Players")
end)(${v.gm})
${deadBlock(3)}
local ${v.k1},${v.k2}=${xorKey},${xorKey2}
local ${v.d}={${encUrl.join(',')}}
${deadBlock(2)}
local ${v.ma},${v.mb},${v.mc},${v.md},${v.me}=${mathA},${mathB},${mathC},${mathD},${mathE}
${deadBlock(2)}
local ${v.cf}=(function()
return{
[${mathA}*${mathB}%997]=function(${v.t7})return ${v.t7}()end,
[(${mathA}+${mathB})%503]=function(${v.t8})return not ${v.t8} end,
[(${mathA}*2+1)%251]=function(${v.t9},${v.t10})return ${v.t9}..${v.t10} end,
}
end)()
${deadBlock(3)}
local ${v.dec}=(function()
${deadBlock(1)}
return function(${v.t11})
local ${v.t12}={}
${deadBlock(1)}
${nest(`for ${v.t13}=1,#${v.t11} do
${v.t12}[${v.t13}]=${v.chr}(${v.xor}(${v.t11}[${v.t13}],(${v.k1}+(${v.t13}-1)*${v.k2})%256))
end`)}
return ${v.cat}(${v.t12})
end
end)()
${deadBlock(4)}
local ${v.hw}=nil
${deadBlock(2)}
${nest(`${v.pcl}(function()
${deadBlock(1)}
if gethwid then ${v.hw}=${wrapCall('gethwid()')} end
if not ${v.hw} and getexecutorhwid then ${v.hw}=${wrapCall('getexecutorhwid()')} end
if not ${v.hw} and get_hwid then ${v.hw}=${wrapCall('get_hwid()')} end
${deadBlock(1)}
if not ${v.hw} and identifyexecutor then
local ${v.t14},${v.t15}=${v.pcl}(identifyexecutor)
if ${v.t14} and ${v.t15} then ${v.hw}=${v.cf}[${v.md}](${v.t15},${v.tstr}(${v.flr}(${v.tck}()*1000)))end
end
if not ${v.hw} and HWID then ${v.hw}=HWID end
${deadBlock(1)}
if not ${v.hw} and syn then ${v.pcl}(function()${v.hw}=syn.hwid()end)end
if not ${v.hw} and fluxus then ${v.pcl}(function()${v.hw}=fluxus:GetHWID()end)end
if not ${v.hw} and Cryptic then ${v.pcl}(function()${v.hw}=Cryptic:GetHWID()end)end
end)`)}
${deadBlock(3)}
${nest(`if not ${v.hw} then
${v.pcl}(function()
${deadBlock(1)}
local ${v.lp}=${v.pl}.LocalPlayer
if ${v.lp} then
local ${v.ui}=${v.tstr}(${v.lp}.UserId)
local ${v.pi}=${v.tstr}(${v.gm}.PlaceId)
local ${v.ji}=${v.sub}(${v.tstr}(${v.gm}.JobId),1,8)
local ${v.gi}=${v.tstr}(${v.gm}.GameId)
${v.hw}=${v.cf}[${v.md}](${v.cf}[${v.md}](${v.cf}[${v.md}](${v.ui},"_"),${v.cf}[${v.md}](${v.pi},"_")),${v.cf}[${v.md}](${v.ji},"_"))
${v.hw}=${v.cf}[${v.md}](${v.hw},${v.gi})
end
end)
end`)}
${deadBlock(2)}
${nest(`if not ${v.hw} then
${v.hw}=${v.cf}[${v.md}]("DL_",${v.cf}[${v.md}](${v.tstr}(${v.flr}(${v.tck}()*100000)),"_"))
${v.hw}=${v.cf}[${v.md}](${v.hw},${v.tstr}(math.random(100000,999999)))
end`)}
${deadBlock(4)}
local ${v.ur}=${v.cf}[${v.md}](${v.cf}[${v.mc}](function()return ${v.dec}(${v.d})end),${v.hw})
${deadBlock(2)}
local ${v.rs}=nil
${nest(`${v.pcl}(function()
${deadBlock(1)}
${v.rs}=${v.gm}:HttpGet(${v.ur})
end)`)}
${deadBlock(3)}
${nest(`if ${v.rs} and #${v.rs}>10 then
local ${v.fn}=nil
${deadBlock(1)}
${v.pcl}(function()
${v.fn}=${v.ld}(${v.rs})
end)
if ${v.fn} and ${v.typ}(${v.fn})=="function" then
${v.pcl}(${v.fn})
end
end`)}
${deadBlock(5)}
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
