import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Embedded collector script (MoonSec V3 obfuscated HWID collector)
const collectorScriptContent = `([[This file was protected with MoonSec V3]]):gsub('.+', (function(a) _vVxZIqfYFevX = a; end)); return(function(o,...)local a;local t;local f;local r;local l;local g;local e=24915;local n=0;local d={};while n<888 do n=n+1;while n<0x2d4 and e%0xd9a<0x6cd do n=n+1 e=(e+376)%10906 local h=n+e if(e%0x2206)>0x1103 then e=(e*0x2b7)%0xa845 while n<0x1b6 and e%0x2458<0x122c do n=n+1 e=(e-633)%48030 local r=n+e if(e%0x1c26)>0xe13 then e=(e*0xd3)%0x3d78 local e=50819 if not d[e]then d[e]=0x1 f=(not f)and _ENV or f;end elseif e%2~=0 then e=(e*0x17c)%0x7d98 local e=89576 if not d[e]then d[e]=0x1 l=function(l)local e=0x01 local function d(n)e=e+n return l:sub(e-n,e-0x01)end while true do local n=d(0x01)if(n=="\\5")then break end local e=t.byte(d(0x01))local e=d(e)if n=="\\2"then e=a.CKVOgGKL(e)elseif n=="\\3"then e=e~="\\0"elseif n=="\\6"then f[e]=function(n,e)return o(8,nil,o,e,n)end elseif n=="\\4"then e=f[e]elseif n=="\\0"then e=f[e][d(t.byte(d(0x01)))];end local n=d(0x08)a[n]=e end end end else e=(e+0x1a3)%0x5a03 n=n+1 local e=93785 if not d[e]then d[e]=0x1 t=string;end end end elseif e%2~=0 then e=(e-0x376)%0x1c98 while n<0xa6 and e%0xb26<0x593 do n=n+1 e=(e+807)%45155 local f=n+e if(e%0x3cc0)<=0x1e60 then e=(e*0xf7)%0x5f50 local e=40127 if not d[e]then d[e]=0x1 a={};end elseif e%2~=0 then e=(e+0x141)%0x2674 local e=44394 if not d[e]then d[e]=0x1 r="\\4\\8\\116\\111\\110\\117\\109\\98\\101\\114\\67\\75\\86\\79\\103\\71\\75\\76\\0\\6\\115\\116\\114\\105\\110\\103\\4\\99\\104\\97\\114\\87\\70\\121\\70\\81\\99\\119\\72\\0\\6\\115\\116\\114\\105\\110\\103\\3\\115\\117\\98\\109\\116\\86\\102\\103\\115\\116\\68\\0\\6\\115\\116\\114\\105\\110\\103\\4\\98\\121\\116\\101\\101\\114\\109\\115\\121\\104\\122\\100\\0\\5\\116\\97\\98\\108\\101\\6\\99\\111\\110\\99\\97\\116\\77\\82\\108\\73\\111\\81\\114\\72\\0\\5\\116\\97\\98\\108\\101\\6\\105\\110\\115\\101\\114\\116\\66\\89\\121\\65\\105\\70\\90\\114\\5";end else e=(e-0x197)%0x2b4d n=n+1 local e=13141 if not d[e]then d[e]=0x1 g=tonumber;end end end else e=(e*0x2b3)%0x5bf8 n=n+1 while n<0x217 and e%0x200c<0x1006 do n=n+1 e=(e+502)%27241 local l=n+e if(e%0x3892)>=0x1c49 then e=(e*0x2ee)%0x44bb local e=38800 if not d[e]then d[e]=0x1 end elseif e%2~=0 then e=(e-0x39c)%0x514 local e=93593 if not d[e]then d[e]=0x1 end else e=(e+0x344)%0x7adb n=n+1 local e=3156 if not d[e]then d[e]=0x1 f=getfenv and getfenv();end end end end end e=(e-346)%37968 end l(r);local e={};for n=0x0,0xff do local d=a.WFyFQcwH(n);e[n]=d;e[d]=n;end local function h(n)return e[n];end local t=(function(o,t)local r,d=0x01,0x10 local n={{},{},{}}local f=-0x01 local e=0x01 local l=o while true do n[0x03][a.mtVfgstD(t,e,(function()e=r+e return e-0x01 end)())]=(function()f=f+0x01 return f end)()if f==(0x0f)then f=""d=0x000 break end end local f=#t while e<f+0x01 do n[0x02][d]=a.mtVfgstD(t,e,(function()e=r+e return e-0x01 end)())d=d+0x01 if d%0x02==0x00 then d=0x00 a.BYyAiFZr(n[0x01],(h((((n[0x03][n[0x02][0x00]]or 0x00)*0x10)+(n[0x03][n[0x02][0x01]]or 0x00)+l)%0x100)));l=o+l;end end return a.MRlIoQrH(n[0x01])end);l(t(238,"%T8>XWwoM}FhZ:)-To"));l(t(97,"%:3_SJ-7uWP+qRLHWHSSJFHyuR3_q7JHW+WPSPL:u_3:qJSJLJW-_-L3JqPLSLJuLPu7_:RQSPkP+PSJRu7J3_qWHqWHPWSPLDuS3WPL_uOqP0:S+-7S:qSqH:HRWR_PR!7S>qSWJ(L_WJ3_q7Su=7+-SHRLu/3S+RH-WWP:_SL-7W+J++J3H3PS_+qSu3LP+R_uH:7+3S--{R:_PSJ3LPu:3H++-RHWWWS3RP7JHLPP-:j<7H3JRW:&+_+LJuH+W+_uqL73ePuuSuRS-J_-P-J+?7_PRLLq7u:uq:JWWWP7_HLz78::+u3HRuW73u+u7WCWWRLuuWW73HR*-Vj:PuSh+HJH:LqR-+ILuwRu7uu33_+WJR(3W33+qOu3 q+-JWte3WqPR--7FRPJS3H3uR3+R:-< -u33_LL:J+uqlJ_xJWuRSRS7W:++PJqH--q_P+JJWLWW7SPu-"));local e=(-1926+(function()local f,d=0,1;(function(d,n,e)e(e(n,e,e),n(e,d,n),e(d,e,d))end)(function(e,n,l)if f>102 then return e end f=f+1 d=(d-263)%6266 if(d%1670)<835 then d=(d*537)%22611 return n(n(l,e,n)and l(n,e,e),e(n and e,l and e,n),e(e,n,l))else return e end return l end,function(l,n,e)if f>283 then return e end f=f+1 d=(d+946)%48343 if(d%1294)>647 then return l else return n(l(l,e,e),n(n,l,n),n(e,n,e))end return e(n(e,n and n,n),l(e,e,l),n(n and l,e,e)and l(e,l,e))end,function(l,e,n)if f>370 then return e end f=f+1 d=(d+331)%3115 if(d%1224)<=612 then return l(e(e,e,n),l(n,n,e),l(l,n,n))else return e end return e end)return d;end)())local fe=(getfenv)or(function()return _ENV end);local b=a.dDEeutxK or a.CMm_PrcX;local p=1;local l=3;local f=2;local r=4;local function de(u,...)local s=t(e,"...");local n=0;a.GhyeYWfm(function()n=n+1 end)local function e(d,e)if e then return n end;n=d+n;end local d,n,h=o(0,o,e,s,a.ermsyhzd);local function t()local n,d=a.ermsyhzd(s,e(1,3),e(5,6)+2);e(2);return(d*256)+n;end;local c=true;local c=0 local function k()local f=n();local e=n();local l=1;local f=(d(e,1,20)*(2^32))+f;local n=d(e,21,31);local e=((-1)^d(e,32));if(n==0)then if(f==c)then return e*0;else n=1;l=0;end;elseif(n==2047)then return(f==0)and(e*(1/0))or(e*(0/0));end;return a.ZyBvRlWa(e,n-1023)*(l+(f/(2^52)));end;local _=n;local function m(n)local d;if(not n)then n=_();if(n==0)then return'';end;end;d=a.mtVfgstD(s,e(1,3),e(5,6)+n-1);e(n)local e=""for n=(1+c),#d do e=e..a.mtVfgstD(d,n,n)end return e;end;local c=#a.FgTFxI_l(g('\\49.\\48'))~=1 local e=n;local function de(...)return{...},a.povfmJLx('#',...)end local function ne()...end;local function ee(d,e,n)...end local function c(j,u,h)...end;return c(ne(),{},fe())(...);end);return de("DefendLua");`;

console.log("Collector script embedded successfully");

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

      if (!collectorScriptContent) {
        return new Response('print("Error: Collector script not loaded")', {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }

      return new Response(collectorScriptContent, {
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
      .select("script_key, hwid_list, ip_list, hwid_blacklist, public_access, script_name, owner_id")
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

    // Helper function to log access attempts
    const logAccess = async (status: string, reason?: string) => {
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid,
        ip_address: clientIp,
        status,
        reason,
      });
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
