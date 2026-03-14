import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const format = url.searchParams.get("format"); // "json" for API calls from React app

  if (!token) {
    if (format === "json") {
      return new Response(JSON.stringify({ error: "Invalid request. No token provided." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response("Invalid request.", { status: 400, headers: { "Content-Type": "text/html" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Look up the verification record
  const { data: verification, error } = await supabase
    .from("key_link_verifications")
    .select("*, scripts:script_id(script_name)")
    .eq("token", token)
    .single();

  if (error || !verification) {
    const msg = "This verification link is invalid or has already expired. Please use /getkey again in Discord.";
    if (format === "json") return new Response(JSON.stringify({ error: msg }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(msg, { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  // Check if already completed
  if (verification.completed) {
    const msg = "You've already completed this verification. Go back to Discord and click the button to get your key.";
    if (format === "json") return new Response(JSON.stringify({ error: msg, completed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(msg, { headers: { "Content-Type": "text/plain" } });
  }

  // Check if expired (10 minutes max)
  const createdAt = new Date(verification.created_at).getTime();
  if (Date.now() - createdAt > 10 * 60 * 1000) {
    const msg = "This verification link has expired. Please use /getkey again in Discord.";
    if (format === "json") return new Response(JSON.stringify({ error: msg }), { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(msg, { status: 410, headers: { "Content-Type": "text/plain" } });
  }

  // Get the provider link from key_system_configs
  const { data: config } = await supabase
    .from("key_system_configs")
    .select("provider_link, provider")
    .eq("script_id", verification.script_id)
    .eq("enabled", true)
    .single();

  if (!config) {
    const msg = "The key system for this script has been disabled.";
    if (format === "json") return new Response(JSON.stringify({ error: msg }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(msg, { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  // Mark as visited (but NOT completed yet)
  if (!verification.visited_at) {
    await supabase
      .from("key_link_verifications")
      .update({ visited_at: new Date().toISOString() })
      .eq("id", verification.id);
  }

  // Handle the completion callback
  if (url.searchParams.get("complete") === "true") {
    const visitedAt = verification.visited_at ? new Date(verification.visited_at).getTime() : Date.now();
    const timeSpent = Date.now() - visitedAt;
    const MIN_TIME_MS = 30 * 1000;

    if (timeSpent < MIN_TIME_MS) {
      const remaining = Math.ceil((MIN_TIME_MS - timeSpent) / 1000);
      const msg = `You haven't completed the ${config.provider} task yet. You need to spend at least 30 seconds completing it. Please go back, complete the task, and try again in ${remaining} seconds. Do not try to bypass the key system.`;
      return new Response(JSON.stringify({ error: msg, bypass: true }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as completed
    await supabase
      .from("key_link_verifications")
      .update({ completed: true })
      .eq("id", verification.id);

    return new Response(JSON.stringify({ success: true, message: `Verification complete! Go back to Discord and click the button to get your key.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Return verification data as JSON for the React page
  if (format === "json") {
    const scriptName = verification.scripts?.script_name || "Unknown Script";
    return new Response(JSON.stringify({
      provider: config.provider,
      providerLink: config.provider_link,
      scriptName,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fallback: redirect to the website verify page
  return new Response(null, {
    status: 302,
    headers: { Location: `https://defendlua-protect-panel.lovable.app/verify?token=${token}` },
  });
});
