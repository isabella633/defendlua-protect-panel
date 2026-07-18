const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin-only permission (Administrator = "8")
const ADMIN_ONLY = "8";

const commands = [
  // ── Public commands (anyone can use) ──
  { name: "help", description: "Show all available bot commands" },
  { name: "link", description: "Link your Discord account to DefendLua", options: [{ name: "code", description: "The 6-character link code", type: 3, required: true }] },
  { name: "loader", description: "Browse available scripts — get script, redeem, get key, or view stats", default_member_permissions: ADMIN_ONLY },
  { name: "getkey", description: "Get a key for a script by completing a link" },
  { name: "redeem", description: "Redeem a key — gives you a script to execute that auto-whitelists your HWID", options: [
    { name: "key", description: "The key you received", type: 3, required: true },
  ]},

  // ── Admin/Owner only commands ──
  { name: "scripts", description: "List all your scripts", default_member_permissions: ADMIN_ONLY },

  // Select-menu commands
  { name: "stats", description: "View detailed stats for a script (select from dropdown)", default_member_permissions: ADMIN_ONLY },
  { name: "logs", description: "View recent access logs for a script (select from dropdown)", default_member_permissions: ADMIN_ONLY },
  { name: "denied", description: "View recently denied HWIDs (select from dropdown)", default_member_permissions: ADMIN_ONLY },
  { name: "resetwhitelist", description: "Clear all HWIDs from a script's whitelist (select from dropdown)", default_member_permissions: ADMIN_ONLY },
  { name: "resetblacklist", description: "Clear all HWIDs from a script's blacklist (select from dropdown)", default_member_permissions: ADMIN_ONLY },
  { name: "toggle", description: "Toggle public/private access for a script (select from dropdown)", default_member_permissions: ADMIN_ONLY },
  { name: "info", description: "View full details of a script (select from dropdown)", default_member_permissions: ADMIN_ONLY },
  { name: "delete", description: "Delete a script permanently (select from dropdown)", default_member_permissions: ADMIN_ONLY },
  { name: "webhook", description: "Set or remove a Discord webhook URL for a script", default_member_permissions: ADMIN_ONLY, options: [{ name: "url", description: "Webhook URL (leave empty to remove)", type: 3, required: false }] },

  // Commands that need typed input
  { name: "whitelist", description: "Whitelist a Discord user (generates a key & DMs them)", default_member_permissions: ADMIN_ONLY, options: [
    { name: "user", description: "Discord user to whitelist", type: 6, required: false },
    { name: "hwid", description: "HWID to whitelist (manual)", type: 3, required: false },
    { name: "expiry", description: "Key expiry duration (e.g. 24h, 1d, 1w, 1m, 1y, 0 = lifetime)", type: 3, required: false },
  ]},
  { name: "unwhitelist", description: "Remove a user (or HWID) from the whitelist", default_member_permissions: ADMIN_ONLY, options: [
    { name: "user", description: "Discord user to remove", type: 6, required: false },
    { name: "hwid", description: "HWID to remove (manual)", type: 3, required: false },
  ]},
  { name: "blacklist", description: "Add HWID to blacklist", default_member_permissions: ADMIN_ONLY, options: [{ name: "hwid", description: "HWID to blacklist", type: 3, required: true }] },
  { name: "unblacklist", description: "Remove HWID from blacklist", default_member_permissions: ADMIN_ONLY, options: [{ name: "hwid", description: "HWID to remove", type: 3, required: true }] },
  { name: "rename", description: "Rename a script", default_member_permissions: ADMIN_ONLY, options: [{ name: "name", description: "New script name", type: 3, required: true }] },
  { name: "lookup", description: "Check if an HWID is whitelisted/blacklisted across all scripts", default_member_permissions: ADMIN_ONLY, options: [{ name: "hwid", description: "HWID to look up", type: 3, required: true }] },
  { name: "resetkey", description: "Reset a user's key HWID lock so they can switch devices", default_member_permissions: ADMIN_ONLY, options: [
    { name: "user", description: "Discord user whose key to reset", type: 6, required: false },
    { name: "hwid", description: "Specific HWID to reset (manual)", type: 3, required: false },
  ]},

  // Key System management
  { name: "keys", description: "List all active keys for a script (select from dropdown)", default_member_permissions: ADMIN_ONLY },
  { name: "setup", description: "Set up a key system for a script", default_member_permissions: ADMIN_ONLY, options: [
    { name: "script", description: "Script name to set up", type: 3, required: true },
    { name: "provider", description: "Link provider", type: 3, required: true, choices: [{ name: "Linkvertise", value: "linkvertise" }, { name: "WorkInk", value: "workink" }] },
    { name: "link", description: "Your monetization link URL", type: 3, required: true },
    { name: "expiry", description: "Key expiry duration (e.g. 24h, 1d, 1w, 1m, 1y, default: 24h)", type: 3, required: false },
    { name: "mode", description: "What happens on redeem", type: 3, required: false, choices: [{ name: "Add HWID to whitelist", value: "whitelist" }, { name: "Temporary access pass", value: "temporary" }] },
  ]},
  { name: "removesetup", description: "Remove the key system from a script (select from dropdown)", default_member_permissions: ADMIN_ONLY },

  // Staff role management
  { name: "role", description: "Manage staff roles that can use basic bot commands", default_member_permissions: ADMIN_ONLY, options: [
    { name: "action", description: "Add or remove a staff role", type: 3, required: true, choices: [{ name: "Add role", value: "add" }, { name: "Remove role", value: "remove" }, { name: "List roles", value: "list" }] },
    { name: "role", description: "The Discord role to add/remove", type: 8, required: false },
  ]},
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
