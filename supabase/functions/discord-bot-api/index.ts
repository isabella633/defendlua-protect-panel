import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bot-token",
};

interface LinkCodeRequest {
  action: "verify_code";
  code: string;
  discord_id: string;
  discord_username: string;
}

interface ScriptsRequest {
  action: "get_scripts";
  discord_id: string;
}

interface WhitelistRequest {
  action: "whitelist" | "unwhitelist" | "blacklist" | "unblacklist";
  discord_id: string;
  script_name: string;
  hwid: string;
}

type BotRequest = LinkCodeRequest | ScriptsRequest | WhitelistRequest;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify bot token
    const botToken = req.headers.get("x-bot-token");
    const expectedToken = Deno.env.get("DISCORD_BOT_TOKEN");
    
    if (!botToken || botToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid bot token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BotRequest = await req.json();

    // Handle different actions
    switch (body.action) {
      case "verify_code": {
        const { code, discord_id, discord_username } = body as LinkCodeRequest;
        
        // Find valid link code
        const { data: linkCode, error: codeError } = await supabase
          .from("discord_link_codes")
          .select("*")
          .eq("code", code.toUpperCase())
          .eq("used", false)
          .gt("expires_at", new Date().toISOString())
          .single();

        if (codeError || !linkCode) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid or expired code" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if Discord is already linked to another account
        const { data: existingLink } = await supabase
          .from("discord_links")
          .select("*")
          .eq("discord_id", discord_id)
          .single();

        if (existingLink) {
          return new Response(
            JSON.stringify({ success: false, error: "This Discord account is already linked to another user" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create the link
        const { error: linkError } = await supabase
          .from("discord_links")
          .upsert({
            user_id: linkCode.user_id,
            discord_id,
            discord_username,
            linked_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (linkError) {
          console.error("Link error:", linkError);
          return new Response(
            JSON.stringify({ success: false, error: "Failed to create link" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Mark code as used
        await supabase
          .from("discord_link_codes")
          .update({ used: true })
          .eq("id", linkCode.id);

        // Get username for confirmation
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", linkCode.user_id)
          .single();

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully linked to account: ${profile?.username || "Unknown"}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_scripts": {
        const { discord_id } = body as ScriptsRequest;

        // Get user from Discord link
        const { data: link, error: linkError } = await supabase
          .from("discord_links")
          .select("user_id")
          .eq("discord_id", discord_id)
          .single();

        if (linkError || !link) {
          return new Response(
            JSON.stringify({ success: false, error: "Discord account not linked. Use /link <code> to link your account." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user's scripts
        const { data: scripts, error: scriptsError } = await supabase
          .from("scripts")
          .select("id, script_name, hwid_list, hwid_blacklist, created_at")
          .eq("owner_id", link.user_id)
          .order("created_at", { ascending: false });

        if (scriptsError) {
          return new Response(
            JSON.stringify({ success: false, error: "Failed to fetch scripts" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            scripts: scripts.map(s => ({
              id: s.id,
              name: s.script_name,
              whitelist_count: s.hwid_list?.length || 0,
              blacklist_count: s.hwid_blacklist?.length || 0,
            }))
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "whitelist":
      case "unwhitelist":
      case "blacklist":
      case "unblacklist": {
        const { discord_id, script_name, hwid, action } = body as WhitelistRequest;

        // Get user from Discord link
        const { data: link, error: linkError } = await supabase
          .from("discord_links")
          .select("user_id")
          .eq("discord_id", discord_id)
          .single();

        if (linkError || !link) {
          return new Response(
            JSON.stringify({ success: false, error: "Discord account not linked. Use /link <code> to link your account." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Find the script by name
        const { data: script, error: scriptError } = await supabase
          .from("scripts")
          .select("*")
          .eq("owner_id", link.user_id)
          .ilike("script_name", script_name)
          .single();

        if (scriptError || !script) {
          return new Response(
            JSON.stringify({ success: false, error: `Script "${script_name}" not found` }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let updateData: { hwid_list?: string[]; hwid_blacklist?: string[] } = {};
        let message = "";

        if (action === "whitelist") {
          const currentList = script.hwid_list || [];
          if (currentList.includes(hwid)) {
            return new Response(
              JSON.stringify({ success: false, error: "HWID is already whitelisted" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          updateData.hwid_list = [...currentList, hwid];
          // Also remove from blacklist if present
          if (script.hwid_blacklist?.includes(hwid)) {
            updateData.hwid_blacklist = script.hwid_blacklist.filter((h: string) => h !== hwid);
          }
          message = `Added ${hwid} to whitelist for "${script.script_name}"`;
        } 
        else if (action === "unwhitelist") {
          const currentList = script.hwid_list || [];
          if (!currentList.includes(hwid)) {
            return new Response(
              JSON.stringify({ success: false, error: "HWID is not in the whitelist" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          updateData.hwid_list = currentList.filter((h: string) => h !== hwid);
          message = `Removed ${hwid} from whitelist for "${script.script_name}"`;
        }
        else if (action === "blacklist") {
          const currentList = script.hwid_blacklist || [];
          if (currentList.includes(hwid)) {
            return new Response(
              JSON.stringify({ success: false, error: "HWID is already blacklisted" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          updateData.hwid_blacklist = [...currentList, hwid];
          // Also remove from whitelist if present
          if (script.hwid_list?.includes(hwid)) {
            updateData.hwid_list = script.hwid_list.filter((h: string) => h !== hwid);
          }
          message = `Added ${hwid} to blacklist for "${script.script_name}"`;
        }
        else if (action === "unblacklist") {
          const currentList = script.hwid_blacklist || [];
          if (!currentList.includes(hwid)) {
            return new Response(
              JSON.stringify({ success: false, error: "HWID is not in the blacklist" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          updateData.hwid_blacklist = currentList.filter((h: string) => h !== hwid);
          message = `Removed ${hwid} from blacklist for "${script.script_name}"`;
        }

        // Update the script
        const { error: updateError } = await supabase
          .from("scripts")
          .update(updateData)
          .eq("id", script.id);

        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: "Failed to update script" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Discord bot API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
