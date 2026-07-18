import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("s") || "").slice(0, 128);
    const hwid = (url.searchParams.get("h") || "").slice(0, 256);
    const reason = (url.searchParams.get("r") || "unknown").slice(0, 128);

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const ua = req.headers.get("user-agent")?.slice(0, 512) || null;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Resolve script
    let scriptId: string | null = null;
    let ownerId: string | null = null;
    if (slug) {
      const { data: script } = await admin
        .from("scripts")
        .select("id, owner_id")
        .eq("slug", slug)
        .maybeSingle();
      if (script) {
        scriptId = script.id;
        ownerId = script.owner_id;
      }
    }

    // Try to link the HWID to a Discord user via a redeemed key
    let discordUserId: string | null = null;
    let discordUsername: string | null = null;
    if (hwid && scriptId) {
      const { data: key } = await admin
        .from("generated_keys")
        .select("discord_user_id, discord_username")
        .eq("script_id", scriptId)
        .eq("redeemed_hwid", hwid)
        .maybeSingle();
      if (key) {
        discordUserId = key.discord_user_id ?? null;
        discordUsername = key.discord_username ?? null;
      }
    }

    await admin.from("tamper_logs").insert({
      script_id: scriptId,
      script_slug: slug || null,
      reason,
      hwid: hwid || null,
      ip,
      user_agent: ua,
      discord_user_id: discordUserId,
      discord_username: discordUsername,
    });

    // Fire webhook to script owner if configured
    if (scriptId) {
      const { data: script } = await admin
        .from("scripts")
        .select("script_name, webhook_url")
        .eq("id", scriptId)
        .maybeSingle();
      if (script?.webhook_url) {
        const embed = {
          title: "⚠️ Tamper Detected",
          color: 0xff3355,
          fields: [
            { name: "Script", value: script.script_name || slug, inline: true },
            { name: "Reason", value: reason, inline: true },
            { name: "IP", value: ip || "unknown", inline: true },
            { name: "HWID", value: hwid ? `\`${hwid.slice(0, 64)}\`` : "unknown", inline: false },
            {
              name: "Discord",
              value: discordUserId ? `<@${discordUserId}> (${discordUsername || "?"})` : "not linked",
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        };
        // Fire and forget
        fetch(script.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embeds: [embed] }),
        }).catch(() => {});
      }
    }

    // Return a tiny 1x1 gif so the client HttpGet always completes cleanly
    return new Response("ok", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (e) {
    console.error("report-tamper error", e);
    return new Response("err", { status: 200, headers: corsHeaders });
  }
});
