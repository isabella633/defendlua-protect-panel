const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const commands = [
  { name: "link", description: "Link your Discord account to DefendLua", options: [{ name: "code", description: "The 6-character link code", type: 3, required: true }] },
  { name: "scripts", description: "List all your scripts" },
  { name: "help", description: "Show all available bot commands" },

  // Select-menu commands (no script option — bot shows dropdown)
  { name: "stats", description: "View detailed stats for a script (select from dropdown)" },
  { name: "logs", description: "View recent access logs for a script (select from dropdown)" },
  { name: "denied", description: "View recently denied HWIDs (select from dropdown)" },
  { name: "resetwhitelist", description: "Clear all HWIDs from a script's whitelist (select from dropdown)" },
  { name: "resetblacklist", description: "Clear all HWIDs from a script's blacklist (select from dropdown)" },
  { name: "toggle", description: "Toggle public/private access for a script (select from dropdown)" },
  { name: "info", description: "View full details of a script (select from dropdown)" },
  { name: "delete", description: "Delete a script permanently (select from dropdown)" },
  { name: "webhook", description: "Set or remove a Discord webhook URL for a script", options: [{ name: "url", description: "Webhook URL (leave empty to remove)", type: 3, required: false }] },

  // Commands that still need typed input
  { name: "whitelist", description: "Add HWID to whitelist", options: [{ name: "hwid", description: "HWID to whitelist", type: 3, required: true }] },
  { name: "unwhitelist", description: "Remove HWID from whitelist", options: [{ name: "hwid", description: "HWID to remove", type: 3, required: true }] },
  { name: "blacklist", description: "Add HWID to blacklist", options: [{ name: "hwid", description: "HWID to blacklist", type: 3, required: true }] },
  { name: "unblacklist", description: "Remove HWID from blacklist", options: [{ name: "hwid", description: "HWID to remove", type: 3, required: true }] },
  { name: "rename", description: "Rename a script", options: [{ name: "name", description: "New script name", type: 3, required: true }] },
  { name: "lookup", description: "Check if an HWID is whitelisted/blacklisted across all scripts", options: [{ name: "hwid", description: "HWID to look up", type: 3, required: true }] },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const botToken = Deno.env.get("DISCORD_BOT_TOKEN");
  if (!botToken) {
    return new Response(JSON.stringify({ error: "DISCORD_BOT_TOKEN not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const APPLICATION_ID = "1385790808900501676";

  try {
    const res = await fetch(`https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`, {
      method: "PUT",
      headers: {
        "Authorization": `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });

    const data = await res.text();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Discord API error", status: res.status, details: data }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Slash commands registered!", commands: JSON.parse(data) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
