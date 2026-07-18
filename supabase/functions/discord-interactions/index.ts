import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
};

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  UPDATE_MESSAGE: 7,
};

const ComponentType = {
  ACTION_ROW: 1,
  BUTTON: 2,
  STRING_SELECT: 3,
};

const ButtonStyle = {
  PRIMARY: 1,
  SECONDARY: 2,
  SUCCESS: 3,
  DANGER: 4,
};

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function verifySignature(publicKey: string, signature: string, timestamp: string, body: string): Promise<boolean> {
  try {
    const publicKeyBytes = hexToUint8Array(publicKey);
    const signatureBytes = hexToUint8Array(signature);
    const message = new TextEncoder().encode(timestamp + body);
    const key = await crypto.subtle.importKey("raw", publicKeyBytes, { name: "Ed25519" }, false, ["verify"]);
    return await crypto.subtle.verify("Ed25519", key, signatureBytes, message);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

function createEmbed(title: string, description: string, color: number, fields?: { name: string; value: string; inline?: boolean }[]) {
  return {
    embeds: [{
      title,
      description,
      color,
      fields,
      footer: { text: "DefendLua Bot" },
      timestamp: new Date().toISOString(),
    }],
  };
}

function reply(type: number, data: any) {
  return new Response(JSON.stringify({ type, data }), { headers: { "Content-Type": "application/json" } });
}

function errReply(msg: string) {
  return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, createEmbed("❌ Error", msg, 0xff0000));
}

function notLinkedReply() {
  return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, createEmbed("❌ Not Linked", "Your Discord account is not linked. Use `/link <code>` to link your account.", 0xff0000));
}

async function getUserId(supabase: any, discordId: string) {
  const { data, error } = await supabase
    .from("discord_links")
    .select("user_id")
    .eq("discord_id", discordId)
    .single();
  if (error || !data) return null;
  return data.user_id;
}

async function findScript(supabase: any, userId: string, scriptName: string) {
  const { data, error } = await supabase
    .from("scripts")
    .select("*")
    .eq("owner_id", userId)
    .ilike("script_name", scriptName)
    .single();
  if (error || !data) return null;
  return data;
}

async function getUserScripts(supabase: any, userId: string) {
  const { data } = await supabase
    .from("scripts")
    .select("id, script_name, hwid_list, hwid_blacklist, public_access, webhook_url, created_at, script_key, ip_list, updated_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

// Check if a Discord user has a staff role for any owner in this guild
// Returns the owner's user_id if they have a staff role, or null
async function getStaffOwnerId(supabase: any, discordMemberRoles: string[], guildId: string): Promise<string | null> {
  if (!discordMemberRoles?.length || !guildId) return null;
  const { data } = await supabase
    .from("discord_bot_roles")
    .select("user_id, role_id")
    .eq("guild_id", guildId);
  if (!data?.length) return null;
  
  for (const entry of data) {
    if (discordMemberRoles.includes(entry.role_id)) return entry.user_id;
  }
  return null;
}

// Get scripts that have key system enabled (for /getkey - any user)
async function getKeySystemScripts(supabase: any) {
  const { data } = await supabase
    .from("key_system_configs")
    .select("script_id, provider, provider_link, key_expiry_hours, redeem_action, scripts:script_id(id, script_name, owner_id)")
    .eq("enabled", true);
  return data || [];
}

// Parse duration string like "1h", "1d", "1w", "1m", "1y", or plain number (hours)
// Returns hours (0 = lifetime)
function parseDuration(input: string | number | null | undefined): number {
  if (input === null || input === undefined || input === "") return 24;
  const str = String(input).trim().toLowerCase();
  if (str === "0" || str === "lifetime" || str === "forever") return 0;
  const match = str.match(/^(\d+(?:\.\d+)?)\s*(h|d|w|m|y|hr|hrs|hour|hours|day|days|week|weeks|month|months|year|years)?$/);
  if (!match) {
    const num = Number(str);
    return isNaN(num) ? 24 : num;
  }
  const value = parseFloat(match[1]);
  const unit = match[2] || "h";
  switch (unit) {
    case "h": case "hr": case "hrs": case "hour": case "hours": return value;
    case "d": case "day": case "days": return value * 24;
    case "w": case "week": case "weeks": return value * 24 * 7;
    case "m": case "month": case "months": return value * 24 * 30;
    case "y": case "year": case "years": return value * 24 * 365;
    default: return value;
  }
}

// Format hours into human-readable duration
function formatDuration(hours: number): string {
  if (hours === 0) return "♾️ Lifetime";
  if (hours >= 24 * 365 * 90) return "♾️ Lifetime"; // ~100 years = lifetime
  if (hours >= 24 * 365 && hours % (24 * 365) === 0) return `${hours / (24 * 365)}y`;
  if (hours >= 24 * 30 && hours % (24 * 30) === 0) return `${hours / (24 * 30)}mo`;
  if (hours >= 24 * 7 && hours % (24 * 7) === 0) return `${hours / (24 * 7)}w`;
  if (hours >= 24 && hours % 24 === 0) return `${hours / 24}d`;
  return `${hours}h`;
}

// Generate a random key string
function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) key += "-";
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Build a select menu response for choosing a script
function scriptSelectMenu(action: string, scripts: any[], title: string, description: string, extraData?: string) {
  const options = scripts.slice(0, 25).map((s: any) => ({
    label: s.script_name.substring(0, 100),
    description: `ID: ${s.id.substring(0, 50)}`,
    value: `${action}:${s.id}${extraData ? `:${extraData}` : ""}`,
  }));

  return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
    ...createEmbed(title, description, 0x5865f2),
    components: [{
      type: ComponentType.ACTION_ROW,
      components: [{
        type: ComponentType.STRING_SELECT,
        custom_id: `select_script_${action}`,
        placeholder: "Select a script",
        options,
      }],
    }],
  });
}

// Build a confirmation prompt with Yes/No buttons
function confirmationPrompt(action: string, scriptId: string, scriptName: string, description: string, extraData?: string) {
  const confirmId = `confirm_${action}:${scriptId}${extraData ? `:${extraData}` : ""}`;
  const cancelId = `cancel_${action}`;

  return reply(InteractionResponseType.UPDATE_MESSAGE, {
    ...createEmbed(`⚠️ Confirm: ${scriptName}`, description, 0xff6600),
    components: [{
      type: ComponentType.ACTION_ROW,
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.DANGER,
          label: "Yes, confirm",
          custom_id: confirmId,
          emoji: { name: "⚠️" },
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          label: "Cancel",
          custom_id: cancelId,
          emoji: { name: "❌" },
        },
      ],
    }],
  });
}

// Validate Discord webhook URL
function isValidWebhookUrl(url: string): boolean {
  return /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(url);
}

Deno.serve(async (req) => {
  const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");
  if (!DISCORD_PUBLIC_KEY) {
    console.error("DISCORD_PUBLIC_KEY not configured");
    return new Response("Server configuration error", { status: 500 });
  }

  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  if (!signature || !timestamp) {
    return new Response("Missing signature headers", { status: 401 });
  }

  const body = await req.text();
  const isValid = await verifySignature(DISCORD_PUBLIC_KEY, signature, timestamp, body);
  if (!isValid) {
    return new Response("Invalid request signature", { status: 401 });
  }

  const interaction = JSON.parse(body);
  console.log("Received interaction:", interaction.type, interaction.data?.name || interaction.data?.custom_id);

  if (interaction.type === InteractionType.PING) {
    return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), { headers: { "Content-Type": "application/json" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const discordId = interaction.member?.user?.id || interaction.user?.id;
  const discordUsername = interaction.member?.user?.username || interaction.user?.username;

  // ═══════════════════════════════════════
  // SLASH COMMANDS
  // ═══════════════════════════════════════
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = interaction.data;
    const getOpt = (n: string) => options?.find((o: { name: string }) => o.name === n)?.value;

    try {
      switch (name) {
        // ── /help ──
        case "help": {
          const fields = [
            { name: "🔗 /link <code>", value: "Link your Discord to DefendLua", inline: false },
            { name: "📋 /scripts", value: "List all your scripts", inline: false },
            { name: "📊 /stats", value: "View script stats (dropdown)", inline: true },
            { name: "ℹ️ /info", value: "Full script details (dropdown)", inline: true },
            { name: "📋 /logs", value: "Recent access logs (dropdown)", inline: true },
            { name: "🛡️ /denied", value: "Recently denied HWIDs (dropdown)", inline: true },
            { name: "✅ /whitelist @user [expiry]", value: "Whitelist a Discord user (generates key & DMs them)", inline: true },
            { name: "🗑️ /unwhitelist <hwid>", value: "Remove from whitelist (dropdown)", inline: true },
            { name: "🚫 /blacklist <hwid>", value: "Add HWID to blacklist (dropdown)", inline: true },
            { name: "♻️ /unblacklist <hwid>", value: "Remove from blacklist (dropdown)", inline: true },
            { name: "🗑️ /resetwhitelist", value: "Clear whitelist (dropdown + confirm)", inline: true },
            { name: "🗑️ /resetblacklist", value: "Clear blacklist (dropdown + confirm)", inline: true },
            { name: "✏️ /rename <name>", value: "Rename a script (dropdown)", inline: true },
            { name: "🔄 /toggle", value: "Toggle public/private (dropdown)", inline: true },
            { name: "🔗 /webhook [url]", value: "Set/remove webhook (dropdown)", inline: true },
            { name: "🗑️ /delete", value: "Delete script (dropdown + confirm)", inline: true },
            { name: "🔍 /lookup <hwid>", value: "Search HWID across all scripts", inline: true },
            { name: "🔑 /setup", value: "Set up key system (Linkvertise/WorkInk)", inline: true },
            { name: "🗑️ /removesetup", value: "Remove key system (dropdown)", inline: true },
            { name: "🎫 /getkey", value: "Get a key by completing a link", inline: true },
            { name: "✅ /redeem <key>", value: "Redeem a key (gives you a script to run)", inline: true },
            { name: "🔄 /resetkey [@user|hwid]", value: "Reset a key's HWID lock (dropdown)", inline: true },
            { name: "🔑 /keys", value: "List all active keys for a script (dropdown)", inline: true },
            { name: "📦 /loader", value: "Browse scripts — get script, key, redeem, stats", inline: true },
          ];
          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📖 DefendLua Bot Commands", "Commands with **(dropdown)** let you pick a script. Destructive actions require **(confirm)**.", 0x5865f2, fields));
        }

        // ── /link ──
        case "link": {
          const code = getOpt("code");
          if (!code) return errReply("Please provide a link code.");

          const { data: linkCode, error: codeError } = await supabase
            .from("discord_link_codes")
            .select("*")
            .eq("code", code.toUpperCase())
            .eq("used", false)
            .gt("expires_at", new Date().toISOString())
            .single();

          if (codeError || !linkCode) return errReply("The code is invalid or has expired.");

          const { data: existingLink } = await supabase
            .from("discord_links")
            .select("*")
            .eq("discord_id", discordId)
            .single();

          if (existingLink) return errReply("Your Discord account is already linked to another DefendLua account.");

          const { error: linkError } = await supabase
            .from("discord_links")
            .upsert({
              user_id: linkCode.user_id,
              discord_id: discordId,
              discord_username: discordUsername,
              linked_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

          if (linkError) return errReply("Failed to link your account. Please try again.");

          await supabase.from("discord_link_codes").update({ used: true }).eq("id", linkCode.id);

          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", linkCode.user_id)
            .single();

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("✅ Account Linked!", `Successfully linked to DefendLua account: **${profile?.username || "Unknown"}**`, 0x00ff00));
        }

        // ── /scripts ──
        case "scripts": {
          const memberRoles = interaction.member?.roles || [];
          const guildId = interaction.guild_id;
          let userId = await getUserId(supabase, discordId);
          if (!userId) {
            userId = await getStaffOwnerId(supabase, memberRoles, guildId);
            if (!userId) return notLinkedReply();
          }

          const scripts = await getUserScripts(supabase, userId);

          if (!scripts.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📋 Scripts", "No scripts found.", 0x5865f2));

          const fields = scripts.slice(0, 15).map((s: any) => ({
            name: `📜 ${s.script_name}`,
            value: `WL: ${s.hwid_list?.length || 0} | BL: ${s.hwid_blacklist?.length || 0} | ${s.public_access ? '🌐 Public' : '🔒 Private'}`,
            inline: true,
          }));

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📋 Scripts", `**${scripts.length}** script(s)`, 0x5865f2, fields));
        }

        // ── SELECT MENU COMMANDS (show dropdown to pick script) ──
        // Safe commands: staff + owner allowed
        case "stats":
        case "logs":
        case "denied":
        case "keys":
        case "info":
        // Dangerous commands: owner only
        case "resetwhitelist":
        case "resetblacklist":
        case "toggle":
        case "delete": {
          const dangerousCommands = ["resetwhitelist", "resetblacklist", "toggle", "delete"];
          const memberRoles = interaction.member?.roles || [];
          const guildId = interaction.guild_id;
          let userId = await getUserId(supabase, discordId);
          let isStaff = false;
          if (!userId) {
            if (dangerousCommands.includes(name)) {
              return errReply("Only the script owner can use this command.");
            }
            userId = await getStaffOwnerId(supabase, memberRoles, guildId);
            if (!userId) return notLinkedReply();
            isStaff = true;
          }

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("No scripts found.");

          const titles: Record<string, string> = {
            stats: "📊 Select a script",
            logs: "📋 Select a script",
            denied: "🛡️ Select a script",
            keys: "🔑 Select a script",
            resetwhitelist: "🗑️ Select a script to reset whitelist",
            resetblacklist: "🗑️ Select a script to reset blacklist",
            toggle: "🔄 Select a script to toggle access",
            info: "ℹ️ Select a script",
            delete: "⚠️ Select a script to delete",
          };

          const descs: Record<string, string> = {
            stats: "Please select a script to view its stats",
            logs: "Please select a script to view access logs",
            denied: "Please select a script to view denied attempts",
            keys: "Please select a script to view all active keys",
            resetwhitelist: "⚠️ Select a script — you'll be asked to confirm",
            resetblacklist: "⚠️ Select a script — you'll be asked to confirm",
            toggle: "Please select a script to toggle public/private",
            info: "Please select a script to view full details",
            delete: "⚠️ **This action is permanent!** Select a script — you'll be asked to confirm",
          };

          return scriptSelectMenu(name, scripts, titles[name], descs[name]);
        }

        // ── /webhook (with optional url, then select menu) ──
        case "webhook": {
          const url = getOpt("url") || "";

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("You don't have any scripts yet.");

          if (url && !isValidWebhookUrl(url)) {
            return errReply("Invalid webhook URL. Must match: `https://discord.com/api/webhooks/{id}/{token}`");
          }

          const desc = url
            ? `Set webhook to:\n\`${url}\`\nSelect the script below.`
            : "Select a script to **remove** its webhook URL.";

          return scriptSelectMenu("webhook", scripts, "🔗 Select a script for webhook", desc, url || "__remove__");
        }

        // ── /whitelist (supports @user mention OR hwid) ──
        case "whitelist": {
          const targetUser = getOpt("user");
          const hwid = getOpt("hwid");
          const expiry = getOpt("expiry");

          if (!targetUser && !hwid) return errReply("Please provide a Discord user (`user`) or an HWID (`hwid`).");

          const memberRolesWL = interaction.member?.roles || [];
          const guildIdWL = interaction.guild_id;
          let userId = await getUserId(supabase, discordId);
          if (!userId) {
            userId = await getStaffOwnerId(supabase, memberRolesWL, guildIdWL);
            if (!userId) return notLinkedReply();
          }

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("No scripts found.");

          if (targetUser) {
            // Discord user-based whitelist: generate key + DM
            const expiryHours = parseDuration(expiry);
            const extraPayload = `${targetUser}|${expiryHours}`;
            return scriptSelectMenu("whitelist_user", scripts, "✅ Select a script to whitelist user", `User: <@${targetUser}>\nExpiry: ${formatDuration(expiryHours)}\nSelect the script below.`, extraPayload);
          } else {
            // Legacy HWID-based whitelist
            return scriptSelectMenu("whitelist", scripts, "✅ Select a script to whitelist HWID", `HWID: \`${hwid.substring(0, 40)}\`\nSelect the script below.`, hwid);
          }
        }

        // ── /unwhitelist (by user or HWID) ──
        case "unwhitelist": {
          const targetUser = getOpt("user");
          const hwid = getOpt("hwid");
          if (!targetUser && !hwid) return errReply("Please provide a Discord `user` or an `hwid`.");

          const memberRolesUW = interaction.member?.roles || [];
          const guildIdUW = interaction.guild_id;
          let userId = await getUserId(supabase, discordId);
          if (!userId) {
            userId = await getStaffOwnerId(supabase, memberRolesUW, guildIdUW);
            if (!userId) return notLinkedReply();
          }

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("No scripts found.");

          if (targetUser) {
            return scriptSelectMenu("unwhitelist_user", scripts, "🗑️ Select a script to unwhitelist user",
              `User: <@${targetUser}>\nSelect the script below.`, targetUser);
          }
          return scriptSelectMenu("unwhitelist", scripts, "🗑️ Select a script to unwhitelist HWID",
            `HWID: \`${hwid!.substring(0, 40)}\`\nSelect the script below.`, hwid!);
        }

        // ── /blacklist and /unblacklist (by user or HWID) ──
        case "blacklist":
        case "unblacklist": {
          const targetUser = getOpt("user");
          const hwid = getOpt("hwid");
          if (!targetUser && !hwid) return errReply("Please provide a Discord `user` or an `hwid`.");

          const memberRolesHWID = interaction.member?.roles || [];
          const guildIdHWID = interaction.guild_id;
          let userId = await getUserId(supabase, discordId);
          if (!userId) {
            userId = await getStaffOwnerId(supabase, memberRolesHWID, guildIdHWID);
            if (!userId) return notLinkedReply();
          }

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("No scripts found.");

          if (targetUser) {
            const userAction = name === "blacklist" ? "blacklist_user" : "unblacklist_user";
            const label = name === "blacklist"
              ? "🚫 Select a script to blacklist user"
              : "♻️ Select a script to unblacklist user";
            return scriptSelectMenu(userAction, scripts, label,
              `User: <@${targetUser}>\nSelect the script below.`, targetUser);
          }

          const actionLabels: Record<string, string> = {
            blacklist: "🚫 Select a script to blacklist HWID",
            unblacklist: "♻️ Select a script to unblacklist HWID",
          };
          return scriptSelectMenu(name, scripts, actionLabels[name], `HWID: \`${hwid!.substring(0, 40)}\`\nSelect the script below.`, hwid!);
        }

        // ── /rename (needs new name + select menu) ──
        case "rename": {
          const newName = getOpt("name");
          if (!newName) return errReply("Please provide a new name.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("You don't have any scripts yet.");

          return scriptSelectMenu("rename", scripts, "✏️ Select a script to rename", `New name: **${newName}**\nSelect the script below.`, newName);
        }

        // ── /resetkey (owner: reset a key's HWID lock) ──
        case "resetkey": {
          const targetUser = getOpt("user");
          const hwid = getOpt("hwid");

          if (!targetUser && !hwid) return errReply("Please provide a Discord user (`user`) or an HWID (`hwid`).");

          const memberRolesRK = interaction.member?.roles || [];
          const guildIdRK = interaction.guild_id;
          let userId = await getUserId(supabase, discordId);
          if (!userId) {
            userId = await getStaffOwnerId(supabase, memberRolesRK, guildIdRK);
            if (!userId) return notLinkedReply();
          }

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("No scripts found.");

          const extraPayload = JSON.stringify({ targetUser: targetUser || null, hwid: hwid || null });
          return scriptSelectMenu("resetkey", scripts, "🔄 Select a script to reset key HWID",
            targetUser ? `User: <@${targetUser}>\nSelect the script below.` : `HWID: \`${hwid?.substring(0, 40)}\`\nSelect the script below.`,
            extraPayload);
        }

        // ── /lookup ──
        case "lookup": {
          const hwid = getOpt("hwid");
          if (!hwid) return errReply("Please provide an HWID to look up.");

          const memberRolesLU = interaction.member?.roles || [];
          const guildIdLU = interaction.guild_id;
          let userId = await getUserId(supabase, discordId);
          if (!userId) {
            userId = await getStaffOwnerId(supabase, memberRolesLU, guildIdLU);
            if (!userId) return notLinkedReply();
          }

          const scripts = await getUserScripts(supabase, userId);

          if (!scripts.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("🔍 HWID Lookup", "You don't have any scripts.", 0x5865f2));

          const results: { name: string; value: string; inline: boolean }[] = [];
          for (const s of scripts) {
            const inWhitelist = s.hwid_list?.includes(hwid);
            const inBlacklist = s.hwid_blacklist?.includes(hwid);
            if (inWhitelist || inBlacklist) {
              results.push({
                name: `📜 ${s.script_name}`,
                value: `${inWhitelist ? "✅ Whitelisted" : ""}${inWhitelist && inBlacklist ? " | " : ""}${inBlacklist ? "🚫 Blacklisted" : ""}`,
                inline: true,
              });
            }
          }

          if (!results.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("🔍 HWID Lookup", `HWID \`${hwid.substring(0, 20)}...\` was **not found** in any of your ${scripts.length} script(s).`, 0xffaa00));

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("🔍 HWID Lookup", `Found HWID in **${results.length}** script(s)`, 0x5865f2, results));
        }

        // ── /setup (owner: configure key system — no dropdown, script name typed) ──
        case "setup": {
          const scriptName = getOpt("script");
          const provider = getOpt("provider");
          const link = getOpt("link");
          const expiry = parseDuration(getOpt("expiry"));
          const mode = getOpt("mode") || "whitelist";

          if (!scriptName || !provider || !link) return errReply("Please provide a script name, provider, and link.");

          // Validate URL
          try { new URL(link); } catch { return errReply("Invalid URL provided."); }

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const script = await findScript(supabase, userId, scriptName);
          if (!script) return errReply(`Script **${scriptName}** not found. Use \`/scripts\` to see your scripts.`);

          // Upsert key system config directly
          const { error: configError } = await supabase
            .from("key_system_configs")
            .upsert({
              script_id: script.id,
              provider,
              provider_link: link,
              key_expiry_hours: expiry,
              redeem_action: mode,
              enabled: true,
              updated_at: new Date().toISOString(),
            }, { onConflict: "script_id" });

          if (configError) {
            console.error("Setup error:", configError);
            return errReply("Failed to set up key system.");
          }

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("🔑 Key System Configured!", `**${script.script_name}** now has a key system!\n\n**Provider:** ${provider}\n**Link:** ${link}\n**Key Expiry:** ${formatDuration(expiry)}\n**Redeem Action:** ${mode}\n\n⚠️ **IMPORTANT:** Set your ${provider} redirect/target URL to:\n\`https://defendlua.lol/verify\`\n\nThis ensures users are redirected back to receive their key after completing the task.\n\nUsers can now use \`/getkey\` to get a key!`, 0x00ff00));
        }

        // ── /removesetup (owner: remove key system) ──
        case "removesetup": {
          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("You don't have any scripts yet.");

          return scriptSelectMenu("removesetup", scripts, "🗑️ Select a script to remove key system",
            "Select a script to remove its key system configuration.");
        }

        // ── /role (owner: manage staff roles) ──
        case "role": {
          const action = getOpt("action");
          const roleId = getOpt("role");
          const guildId = interaction.guild_id;

          if (!guildId) return errReply("This command can only be used in a server.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          if (action === "list") {
            const { data: roles } = await supabase
              .from("discord_bot_roles")
              .select("role_id")
              .eq("user_id", userId)
              .eq("guild_id", guildId);

            if (!roles?.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              { ...createEmbed("👥 Staff Roles", "No staff roles configured. Use `/role add` to add one.", 0x5865f2), flags: 64 });

            const roleList = roles.map((r: any) => `• <@&${r.role_id}>`).join("\n");
            return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              { ...createEmbed("👥 Staff Roles", `Your staff roles in this server:\n\n${roleList}\n\nMembers with these roles can use basic commands (scripts, whitelist, blacklist, stats, logs, keys, etc.)`, 0x5865f2), flags: 64 });
          }

          if (!roleId) return errReply("Please provide a role.");

          if (action === "add") {
            const { error } = await supabase.from("discord_bot_roles").upsert({
              user_id: userId,
              guild_id: guildId,
              role_id: roleId,
            }, { onConflict: "user_id,guild_id,role_id" });

            if (error) return errReply("Failed to add role.");
            return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              { ...createEmbed("✅ Staff Role Added", `<@&${roleId}> can now use basic bot commands for your scripts.\n\n**Allowed:** scripts, whitelist, unwhitelist, blacklist, unblacklist, stats, logs, keys, lookup, resetkey\n**Owner only:** delete, rename, webhook, setup, resetwhitelist, resetblacklist, toggle`, 0x00ff00), flags: 64 });
          }

          if (action === "remove") {
            const { error } = await supabase.from("discord_bot_roles")
              .delete()
              .eq("user_id", userId)
              .eq("guild_id", guildId)
              .eq("role_id", roleId);

            if (error) return errReply("Failed to remove role.");
            return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              { ...createEmbed("✅ Staff Role Removed", `<@&${roleId}> can no longer use bot commands for your scripts.`, 0xff5555), flags: 64 });
          }

          return errReply("Invalid action.");
        }

        // ── /getkey (any user: get a key by completing a link) ──
        case "getkey": {
          const keyScripts = await getKeySystemScripts(supabase);

          if (!keyScripts.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            { ...createEmbed("🔑 No Key Systems", "No scripts have a key system configured yet.", 0xffaa00), flags: 64 });

          const options = keyScripts.slice(0, 25).map((ks: any) => ({
            label: ks.scripts?.script_name?.substring(0, 100) || "Unknown",
            description: `Provider: ${ks.provider} | Expires: ${formatDuration(ks.key_expiry_hours)}`,
            value: `getkey:${ks.script_id}`,
          }));

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
            ...createEmbed("🔑 Get a Key", "Select a script to get a key. You'll need to complete a link first.", 0x5865f2),
            flags: 64,
            components: [{
              type: ComponentType.ACTION_ROW,
              components: [{
                type: ComponentType.STRING_SELECT,
                custom_id: "select_script_getkey",
                placeholder: "Select a script",
                options,
              }],
            }],
          });
        }

        // ── /loader (owner-scoped: only scripts owned by the invoking Discord user) ──
        case "loader": {
          const invokerUserId = await getUserId(supabase, discordId);
          if (!invokerUserId) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("🔗 Link Required", "Link your Discord account first with `/link` to use the loader.", 0xffaa00));

          const { data: allScripts } = await supabase
            .from("scripts")
            .select("id, script_name, owner_id")
            .eq("owner_id", invokerUserId)
            .order("created_at", { ascending: false });

          if (!allScripts?.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📦 Loader", "You don't own any scripts yet.", 0xffaa00));

          const { data: configs } = await supabase
            .from("key_system_configs")
            .select("script_id, provider, key_expiry_hours, redeem_action")
            .eq("enabled", true);
          const configMap = new Map((configs || []).map((c: any) => [c.script_id, c]));

          const options = allScripts.slice(0, 25).map((s: any) => {
            const cfg: any = configMap.get(s.id);
            return {
              label: s.script_name?.substring(0, 100) || "Unknown",
              description: cfg
                ? `${cfg.provider} | ${formatDuration(cfg.key_expiry_hours)} keys | ${cfg.redeem_action}`.substring(0, 100)
                : "Direct script — no key required",
              value: `loader:${s.id}`,
            };
          });

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
            ...createEmbed("📦 Script Loader", "Select a script to view options.", 0x5865f2),
            components: [{
              type: ComponentType.ACTION_ROW,
              components: [{
                type: ComponentType.STRING_SELECT,
                custom_id: "select_script_loader",
                placeholder: "Select a script",
                options,
              }],
            }],
          });
        }

        // ── /redeem (any user: redeem a key — returns a short loadstring) ──
        case "redeem": {
          const key = getOpt("key");
          if (!key) return errReply("Please provide a key.");

          // Validate the key exists and is valid
          const { data: keyData, error: keyError } = await supabase
            .from("generated_keys")
            .select("id, key, redeemed, expires_at, script_id, scripts:script_id(script_name, slug)")
            .eq("key", key.toUpperCase().trim())
            .single();

          if (keyError || !keyData) return errReply("Invalid key. Please check and try again.");
          if (keyData.redeemed) return errReply("This key has already been redeemed.");
          if (new Date(keyData.expires_at) < new Date()) return errReply("This key has expired. Use `/getkey` to get a new one.");

          const scriptName = keyData.scripts?.script_name || "Unknown";
          const safeKey = keyData.key;
          const scriptSlug = keyData.scripts?.slug;

          const loaderUrl = `https://api.defendlua.lol/s/${scriptSlug || keyData.script_id}`;

          const loadstringCode = `Key = "${safeKey}"\nloadstring(game:HttpGet("${loaderUrl}?redeemkey="..Key))()`;

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
            content: loadstringCode,
            ...createEmbed("✅ Redeem Key", `**Script:** ${scriptName}\n**Key:** \`${safeKey}\`\n\nLong-press the message above to copy your loader code.`, 0x00ff00),
            flags: 64,
          });
        }

        default:
          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("❓ Unknown Command", "This command is not recognized. Use `/help` to see all commands.", 0xff0000));
      }
    } catch (error) {
      console.error("Command error:", error);
      return errReply("An unexpected error occurred.");
    }
  }

  // ═══════════════════════════════════════
  // COMPONENT INTERACTIONS (Select Menus & Buttons)
  // ═══════════════════════════════════════
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId = interaction.data?.custom_id || "";
    const values = interaction.data?.values || [];

    try {
      // ── LOADER BUTTONS (public — no linking required) ──
      if (customId.startsWith("loader_getscript:")) {
        const scriptId = customId.replace("loader_getscript:", "");
        const { data: script } = await supabase.from("scripts").select("script_name, slug").eq("id", scriptId).single();
        if (!script) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, { ...createEmbed("❌ Error", "Script not found.", 0xff0000), flags: 64 });

        // Check if this script has a key system enabled
        const { data: keyConfig } = await supabase
          .from("key_system_configs")
          .select("script_id")
          .eq("script_id", scriptId)
          .eq("enabled", true)
          .maybeSingle();

        const loaderUrl = `https://api.defendlua.lol/s/${script.slug}`;

        if (!keyConfig) {
          // No key system — serve script directly
          const luaLoader = `loadstring(game:HttpGet("${loaderUrl}"))()`;
          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
            content: luaLoader,
            ...createEmbed("📜 Get Script", `**${script.script_name}**\n\nHere is your script. Long-press the message above to copy it.`, 0x00ff00),
            flags: 64,
          });
        }

        // Key system enabled — check if user has a valid key for this script
        const { data: existingKey } = await supabase
          .from("generated_keys")
          .select("key, redeemed, expires_at")
          .eq("script_id", scriptId)
          .eq("discord_id", discordId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingKey && new Date(existingKey.expires_at) > new Date()) {
          const luaLoader = `Key = "${existingKey.key}"\nloadstring(game:HttpGet("${loaderUrl}?redeemkey="..Key))()`;
          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
            content: luaLoader,
            ...createEmbed("📜 Get Script", `**${script.script_name}**\n\nHere is your script. Long-press the message above to copy it.`, 0x00ff00),
            flags: 64,
          });
        } else {
          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
            ...createEmbed("📜 Get Script", `**${script.script_name}**\n\n⚠️ You don't have a valid key yet.\n\nUse the **Get Key** button to obtain a key first, then come back here to get your script.`, 0xffaa00),
            flags: 64,
          });
        }
      }

      if (customId.startsWith("loader_getkey:")) {
        const scriptId = customId.replace("loader_getkey:", "");
        const { data: config } = await supabase
          .from("key_system_configs")
          .select("*, scripts:script_id(script_name)")
          .eq("script_id", scriptId)
          .eq("enabled", true)
          .single();

        if (!config) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
          ...createEmbed("❌ Error", "No key system configured for this script.", 0xff0000), flags: 64,
        });

        const verifyToken = crypto.randomUUID().replace(/-/g, "").substring(0, 24);
        await supabase.from("key_link_verifications").delete().eq("discord_id", discordId).eq("script_id", scriptId);
        await supabase.from("key_link_verifications").insert({ token: verifyToken, discord_id: discordId, script_id: scriptId });

        const verifyLink = `https://defendlua.lol/verify?token=${verifyToken}`;
        return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
          ...createEmbed("🔑 Get Your Key", `**Script:** ${config.scripts?.script_name}\n\n🔗 **Click to start:** ${verifyLink}\n\n1️⃣ Complete the ${config.provider} task\n2️⃣ Get redirected back to receive your key\n\n🚫 Bypass detection is active.`, 0x5865f2),
          flags: 64,
        });
      }

      if (customId.startsWith("loader_redeem:")) {
        const scriptId = customId.replace("loader_redeem:", "");
        const { data: script } = await supabase.from("scripts").select("script_name, slug").eq("id", scriptId).single();
        if (!script) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, { ...createEmbed("❌ Error", "Script not found.", 0xff0000), flags: 64 });

        const loaderBase = `https://api.defendlua.lol/s/${script.slug || scriptId}`;

        const redeemCode = `Key = "YOUR-KEY-HERE"\nloadstring(game:HttpGet("${loaderBase}?redeemkey="..Key))()`;
        return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
          content: redeemCode,
          ...createEmbed("🔑 Redeem a Key", `**${script.script_name}**\n\nUse \`/redeem key:YOUR-KEY-HERE\` to get your loadstring.\n\nLong-press the message above to copy the template, then replace YOUR-KEY-HERE with your actual key.`, 0x00ff00),
          flags: 64,
        });
      }

      if (customId.startsWith("loader_resethwid:")) {
        const scriptId = customId.replace("loader_resethwid:", "");

        // Find the user's most recent redeemed key for this script
        const { data: keyData } = await supabase
          .from("generated_keys")
          .select("redeemed_hwid, scripts:script_id(id, script_name, hwid_list)")
          .eq("discord_id", discordId)
          .eq("script_id", scriptId)
          .eq("redeemed", true)
          .order("redeemed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!keyData) {
          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
            ...createEmbed("❌ No Key Found", "You don't have a redeemed key for this script. Redeem a key first.", 0xff0000),
            flags: 64,
          });
        }

        const hwid = keyData.redeemed_hwid;
        const script = keyData.scripts as any;
        const scriptName = script?.script_name || "Unknown";

        // Remove HWID from whitelist if present
        if (hwid) {
          const currentList = script?.hwid_list || [];
          if (currentList.includes(hwid)) {
            const newList = currentList.filter((h: string) => h !== hwid);
            await supabase.from("scripts").update({ hwid_list: newList }).eq("id", scriptId);
          }
        }

        // Clear the redeemed_hwid on the key so they can re-redeem
        await supabase.from("generated_keys").update({ redeemed_hwid: null, redeemed: false }).eq("discord_id", discordId).eq("script_id", scriptId).eq("redeemed", true).order("redeemed_at", { ascending: false }).limit(1);

        return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
          ...createEmbed("⚙️ HWID Reset", `Your HWID lock has been cleared for **${scriptName}**.\n\nYou can now redeem your key again on a new device.`, 0x00ff00),
          flags: 64,
        });
      }

      if (customId.startsWith("loader_stats:")) {
        const scriptId = customId.replace("loader_stats:", "");
        const { data: script } = await supabase.from("scripts").select("script_name, hwid_list, public_access").eq("id", scriptId).single();
        if (!script) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, { ...createEmbed("❌ Error", "Script not found.", 0xff0000), flags: 64 });

        const { data: activeKey } = await supabase
          .from("generated_keys")
          .select("redeemed, redeemed_at, expires_at")
          .eq("discord_id", discordId)
          .eq("script_id", scriptId)
          .eq("redeemed", true)
          .order("redeemed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let accessStatus = "❌ No active access";
        let timeLeft = "N/A";

        if (activeKey) {
          const expiresAt = new Date(activeKey.expires_at);
          const now = new Date();
          if (expiresAt > now) {
            const hoursLeft = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
            const minsLeft = Math.floor(((expiresAt.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
            if (hoursLeft > 8760) {
              timeLeft = "♾️ Lifetime";
              accessStatus = "✅ Active (Lifetime)";
            } else {
              timeLeft = `${hoursLeft}h ${minsLeft}m`;
              accessStatus = "✅ Active";
            }
          } else {
            accessStatus = "⏰ Expired";
            timeLeft = "Expired";
          }
        }

        const { data: config } = await supabase
          .from("key_system_configs")
          .select("key_expiry_hours, redeem_action")
          .eq("script_id", scriptId)
          .single();

        const fields = [
          { name: "📜 Script", value: script.script_name, inline: true },
          { name: "🌐 Access", value: script.public_access ? "Public" : "Private", inline: true },
          { name: "👥 Whitelisted", value: `${script.hwid_list?.length || 0} users`, inline: true },
          { name: "🔑 Your Status", value: accessStatus, inline: true },
          { name: "⏱️ Time Left", value: timeLeft, inline: true },
          { name: "🔄 Key Duration", value: config ? (config.key_expiry_hours >= 8760 ? "Lifetime" : `${config.key_expiry_hours}h`) : "N/A", inline: true },
          { name: "📋 Redeem Mode", value: config?.redeem_action === "whitelist" ? "HWID Whitelist" : "Temporary Pass", inline: true },
        ];

        return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
          ...createEmbed(`📊 Stats: ${script.script_name}`, "Your access stats for this script", 0x5865f2, fields),
          flags: 64,
        });
      }

      // ── /getkey select menu (public — no linking required) ──
      if (customId === "select_script_getkey") {
        const selectedValue = values[0] || "";
        const parts = selectedValue.split(":");
        const scriptId = parts[1];

        const { data: config, error: configError } = await supabase
          .from("key_system_configs")
          .select("*, scripts:script_id(id, script_name)")
          .eq("script_id", scriptId)
          .eq("enabled", true)
          .single();

        if (configError || !config) {
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("❌ Error", "Key system not found or disabled for this script.", 0xff0000),
            flags: 64,
            components: [],
          });
        }

        const verifyToken = crypto.randomUUID().replace(/-/g, "").substring(0, 24);
        await supabase.from("key_link_verifications").delete().eq("discord_id", discordId).eq("script_id", scriptId);
        await supabase.from("key_link_verifications").insert({ token: verifyToken, discord_id: discordId, script_id: scriptId });

        const verifyLink = `https://defendlua.lol/verify?token=${verifyToken}`;

        return reply(InteractionResponseType.UPDATE_MESSAGE, {
          ...createEmbed("🔑 Complete the Link to Get Your Key", `**Script:** ${config.scripts?.script_name}\n**Provider:** ${config.provider}\n\n🔗 **Click the link below to start:**\n${verifyLink}\n\n1️⃣ You'll be redirected to ${config.provider}\n2️⃣ Complete the full task\n3️⃣ You'll be redirected back to receive your key automatically\n\n🚫 **Bypassing will be detected** — the system verifies your completion.`, 0x5865f2),
          flags: 64,
          components: [],
        });
      }

      // ── All other component interactions require linking or staff role ──
      let userId = await getUserId(supabase, discordId);
      if (!userId) {
        const memberRolesComp = interaction.member?.roles || [];
        const guildIdComp = interaction.guild_id;
        userId = await getStaffOwnerId(supabase, memberRolesComp, guildIdComp);
        if (!userId) return notLinkedReply();
      }

      // ── CANCEL BUTTON ──
      if (customId.startsWith("cancel_")) {
        return reply(InteractionResponseType.UPDATE_MESSAGE, {
          ...createEmbed("❌ Cancelled", "Action was cancelled.", 0x888888),
          components: [],
        });
      }

      // ── CONFIRM BUTTON ──
      if (customId.startsWith("confirm_")) {
        const payload = customId.replace("confirm_", "");
        const parts = payload.split(":");
        const action = parts[0];
        const scriptId = parts[1];
        const extraData = parts.slice(2).join(":");

        const { data: script, error: scriptError } = await supabase
          .from("scripts")
          .select("*")
          .eq("id", scriptId)
          .eq("owner_id", userId)
          .single();

        if (scriptError || !script) {
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("❌ Error", "Script not found or you don't own it.", 0xff0000),
            components: [],
          });
        }

        switch (action) {
          case "delete": {
            await supabase.from("access_logs").delete().eq("script_id", script.id);
            const { error } = await supabase.from("scripts").delete().eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to delete script.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🗑️ Script Deleted", `**${script.script_name}** has been permanently deleted.`, 0xff0000),
              components: [],
            });
          }

          case "resetwhitelist": {
            const count = script.hwid_list?.length || 0;
            const { error } = await supabase.from("scripts").update({ hwid_list: [] }).eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to reset whitelist.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🗑️ Whitelist Reset", `Cleared **${count}** HWID(s) from the whitelist of **${script.script_name}**.`, 0x00ff00),
              components: [],
            });
          }

          case "resetblacklist": {
            const count = script.hwid_blacklist?.length || 0;
            const { error } = await supabase.from("scripts").update({ hwid_blacklist: [] }).eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to reset blacklist.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🗑️ Blacklist Reset", `Cleared **${count}** HWID(s) from the blacklist of **${script.script_name}**.`, 0x00ff00),
              components: [],
            });
          }

          default:
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❓ Unknown", "Unknown confirmation action.", 0xff0000),
              components: [],
            });
        }
      }

      // ── BUTTON: blacklist from webhook notification ──
      if (customId.startsWith("blacklist_")) {
        const hwid = customId.replace("blacklist_", "");

        const embedFields = interaction.message?.embeds?.[0]?.fields || [];
        const scriptIdField = embedFields.find((f: { name: string }) => f.name === "Script ID");
        const scriptId = scriptIdField?.value?.replace(/`/g, "");

        if (!scriptId) return errReply("Could not determine the script. Please use `/blacklist` command instead.");

        const { data: script, error: scriptError } = await supabase
          .from("scripts")
          .select("id, script_name, hwid_blacklist, hwid_list")
          .eq("id", scriptId)
          .eq("owner_id", userId)
          .single();

        if (scriptError || !script) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          createEmbed("❌ Access Denied", "You don't own this script.", 0xff0000));

        const currentBlacklist = script.hwid_blacklist || [];
        if (currentBlacklist.includes(hwid)) {
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("⚠️ Already Blacklisted", `HWID \`${hwid}\` is already blacklisted on **${script.script_name}**.`, 0xffaa00),
            components: [],
          });
        }

        const updateData: any = { hwid_blacklist: [...currentBlacklist, hwid] };
        if (script.hwid_list?.includes(hwid)) {
          updateData.hwid_list = script.hwid_list.filter((h: string) => h !== hwid);
        }

        const { error: updateError } = await supabase.from("scripts").update(updateData).eq("id", script.id);
        if (updateError) return errReply("Failed to blacklist HWID.");

        return reply(InteractionResponseType.UPDATE_MESSAGE, {
          ...createEmbed("🚫 HWID Blacklisted", `Successfully blacklisted \`${hwid}\` on **${script.script_name}**.`, 0xff0000),
          components: [],
        });
      }

      // ── BUTTON: getkey complete (legacy) ──
      if (customId.startsWith("getkey_complete:")) {
        return reply(InteractionResponseType.UPDATE_MESSAGE, {
          ...createEmbed("ℹ️ Key System Updated", "Keys are now issued directly on the verification website after completing the task. Use `/getkey` to get a new link.", 0x5865f2),
          flags: 64,
          components: [],
        });
      }

      // ── SELECT MENU: script selection ──
      if (customId.startsWith("select_script_")) {
        const selectedValue = values[0] || "";
        const parts = selectedValue.split(":");
        const action = parts[0];
        const scriptId = parts[1];
        const extraData = parts.slice(2).join(":");

        // ── loader: post PUBLIC control panel embed with buttons ──
        if (action === "loader") {
          const invokerUserId = await getUserId(supabase, discordId);
          const { data: script } = await supabase
            .from("scripts")
            .select("id, script_name, slug, owner_id")
            .eq("id", scriptId)
            .single();

          if (!script || !invokerUserId || script.owner_id !== invokerUserId) return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("❌ Not Allowed", "You can only deploy loader panels for scripts you own.", 0xff0000),
            components: [],
          });

          const { data: config } = await supabase
            .from("key_system_configs")
            .select("script_id")
            .eq("script_id", scriptId)
            .eq("enabled", true)
            .maybeSingle();

          const scriptName = script.script_name || "Unknown";
          const hasKeySystem = !!config;

          const clearResponse = reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("✅ Control Panel Deployed", `Control panel for **${scriptName}** has been posted below.`, 0x00ff00),
            components: [],
          });

          const componentRows = hasKeySystem
            ? [
                {
                  type: ComponentType.ACTION_ROW,
                  components: [
                    { type: ComponentType.BUTTON, style: ButtonStyle.DANGER, label: "Redeem Key", custom_id: `loader_redeem:${scriptId}`, emoji: { name: "🔑" } },
                    { type: ComponentType.BUTTON, style: ButtonStyle.SUCCESS, label: "Get Script", custom_id: `loader_getscript:${scriptId}`, emoji: { name: "📜" } },
                    { type: ComponentType.BUTTON, style: ButtonStyle.PRIMARY, label: "Get Key", custom_id: `loader_getkey:${scriptId}`, emoji: { name: "🔗" } },
                  ],
                },
                {
                  type: ComponentType.ACTION_ROW,
                  components: [
                    { type: ComponentType.BUTTON, style: ButtonStyle.SECONDARY, label: "Reset HWID", custom_id: `loader_resethwid:${scriptId}`, emoji: { name: "⚙️" } },
                    { type: ComponentType.BUTTON, style: ButtonStyle.SECONDARY, label: "Get Stats", custom_id: `loader_stats:${scriptId}`, emoji: { name: "📊" } },
                  ],
                },
              ]
            : [
                {
                  type: ComponentType.ACTION_ROW,
                  components: [
                    { type: ComponentType.BUTTON, style: ButtonStyle.SUCCESS, label: "Get Script", custom_id: `loader_getscript:${scriptId}`, emoji: { name: "📜" } },
                  ],
                },
              ];

          const followupBody = {
            embeds: [{
              title: `${scriptName} Control Panel`,
              description: hasKeySystem
                ? `This control panel is for the project: **${scriptName}**\nIf you're a buyer, click on the buttons below to redeem your key, get the script or get your stats`
                : `This control panel is for the project: **${scriptName}**\nClick **Get Script** to grab the loadstring — no key required.`,
              color: 0x5865f2,
              footer: {
                text: `DefendLua • Sent by ${discordUsername}`,
              },
              timestamp: new Date().toISOString(),
            }],
            components: componentRows,
          };

          fetch(`https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(followupBody),
          }).catch(err => console.error("Failed to send loader followup:", err));

          return clearResponse;
        }


        // ── getkey: special handling (doesn't require ownership) ──
        if (action === "getkey") {
          // Get the key system config
          const { data: config, error: configError } = await supabase
            .from("key_system_configs")
            .select("*, scripts:script_id(id, script_name)")
            .eq("script_id", scriptId)
            .eq("enabled", true)
            .single();

          if (configError || !config) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❌ Error", "Key system not found or disabled for this script.", 0xff0000),
              flags: 64,
              components: [],
            });
          }

          // Create a unique verification token
          const verifyToken = crypto.randomUUID().replace(/-/g, "").substring(0, 24);

          // Clean up any old verifications for this user+script
          await supabase
            .from("key_link_verifications")
            .delete()
            .eq("discord_id", discordId)
            .eq("script_id", scriptId);

          // Create verification record
          await supabase
            .from("key_link_verifications")
            .insert({
              token: verifyToken,
              discord_id: discordId,
              script_id: scriptId,
            });

          const verifyLink = `https://defendlua.lol/verify?token=${verifyToken}`;

          // Show the verification link — key will be given on the website after completing the provider task
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("🔑 Complete the Link to Get Your Key", `**Script:** ${config.scripts?.script_name}\n**Provider:** ${config.provider}\n\n🔗 **Click the link below to start:**\n${verifyLink}\n\n1️⃣ You'll be redirected to ${config.provider}\n2️⃣ Complete the full task\n3️⃣ You'll be redirected back to receive your key automatically\n\n🚫 **Bypassing will be detected** — the system verifies your completion.`, 0x5865f2),
            flags: 64,
            components: [],
          });
        }

        // ── unwhitelist_user: remove all HWIDs bound to a Discord user's keys ──
        if (action === "unwhitelist_user") {
          const targetUserId = extraData;
          if (!targetUserId) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❌ Error", "No user provided.", 0xff0000),
              components: [],
            });
          }

          const { data: script } = await supabase
            .from("scripts")
            .select("id, script_name, hwid_list")
            .eq("id", scriptId)
            .eq("owner_id", userId)
            .single();

          if (!script) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❌ Error", "Script not found or you don't own it.", 0xff0000),
              components: [],
            });
          }

          const { data: keys } = await supabase
            .from("generated_keys")
            .select("id, redeemed_hwid")
            .eq("script_id", script.id)
            .eq("discord_id", targetUserId)
            .not("redeemed_hwid", "is", null);

          const userHwids = (keys || []).map((k: any) => k.redeemed_hwid).filter(Boolean);
          const currentList: string[] = script.hwid_list || [];
          const toRemove = userHwids.filter((h: string) => currentList.includes(h));

          if (!toRemove.length) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("⚠️ Nothing to Remove", `<@${targetUserId}> has no HWIDs on the whitelist for **${script.script_name}**.`, 0xffaa00),
              components: [],
            });
          }

          const newList = currentList.filter((h: string) => !toRemove.includes(h));
          const { error: upErr } = await supabase.from("scripts").update({ hwid_list: newList }).eq("id", script.id);
          if (upErr) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❌ Error", "Failed to update whitelist.", 0xff0000),
              components: [],
            });
          }

          // Also clear the HWID lock on those keys so the user can re-redeem elsewhere if needed
          const keyIds = (keys || []).filter((k: any) => toRemove.includes(k.redeemed_hwid)).map((k: any) => k.id);
          if (keyIds.length) {
            await supabase.from("generated_keys").update({ redeemed_hwid: null, redeemed: false }).in("id", keyIds);
          }

          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("🗑️ User Unwhitelisted", `Removed **${toRemove.length}** HWID${toRemove.length === 1 ? "" : "s"} for <@${targetUserId}> from **${script.script_name}**.`, 0x00ff00),
            components: [],
          });
        }

        // ── blacklist_user / unblacklist_user: (un)blacklist all HWIDs bound to a Discord user's keys ──
        if (action === "blacklist_user" || action === "unblacklist_user") {
          const targetUserId = extraData;
          if (!targetUserId) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❌ Error", "No user provided.", 0xff0000),
              components: [],
            });
          }

          const { data: script } = await supabase
            .from("scripts")
            .select("id, script_name, hwid_list, hwid_blacklist")
            .eq("id", scriptId)
            .eq("owner_id", userId)
            .single();

          if (!script) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❌ Error", "Script not found or you don't own it.", 0xff0000),
              components: [],
            });
          }

          const { data: keys } = await supabase
            .from("generated_keys")
            .select("redeemed_hwid")
            .eq("script_id", script.id)
            .eq("discord_id", targetUserId)
            .not("redeemed_hwid", "is", null);

          const userHwids: string[] = Array.from(new Set((keys || []).map((k: any) => k.redeemed_hwid).filter(Boolean)));

          if (!userHwids.length) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("⚠️ No HWIDs Found", `<@${targetUserId}> has no redeemed HWIDs on **${script.script_name}**.`, 0xffaa00),
              components: [],
            });
          }

          const currentBL: string[] = script.hwid_blacklist || [];
          const currentWL: string[] = script.hwid_list || [];

          if (action === "blacklist_user") {
            const toAdd = userHwids.filter((h: string) => !currentBL.includes(h));
            const newBL = [...currentBL, ...toAdd];
            const newWL = currentWL.filter((h: string) => !userHwids.includes(h));
            const { error } = await supabase.from("scripts").update({ hwid_blacklist: newBL, hwid_list: newWL }).eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to update blacklist.", 0xff0000), components: [] });
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🚫 User Blacklisted", `Blacklisted **${toAdd.length}** HWID${toAdd.length === 1 ? "" : "s"} for <@${targetUserId}> on **${script.script_name}**.`, 0xff0000),
              components: [],
            });
          } else {
            const toRemove = userHwids.filter((h: string) => currentBL.includes(h));
            if (!toRemove.length) {
              return reply(InteractionResponseType.UPDATE_MESSAGE, {
                ...createEmbed("⚠️ Nothing to Remove", `<@${targetUserId}> has no HWIDs on the blacklist for **${script.script_name}**.`, 0xffaa00),
                components: [],
              });
            }
            const newBL = currentBL.filter((h: string) => !toRemove.includes(h));
            const { error } = await supabase.from("scripts").update({ hwid_blacklist: newBL }).eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to update blacklist.", 0xff0000), components: [] });
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("♻️ User Unblacklisted", `Removed **${toRemove.length}** HWID${toRemove.length === 1 ? "" : "s"} for <@${targetUserId}> from the blacklist of **${script.script_name}**.`, 0x00ff00),
              components: [],
            });
          }
        }



        if (action === "whitelist_user") {
          const [targetUserId, expiryHoursRaw] = extraData.split("|");
          const expiryHours = Number(expiryHoursRaw || "24");

          if (!targetUserId || Number.isNaN(expiryHours)) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❌ Error", "Invalid whitelist request data.", 0xff0000),
              components: [],
            });
          }

          const { data: script } = await supabase
            .from("scripts")
            .select("id, script_name, slug, owner_id")
            .eq("id", scriptId)
            .eq("owner_id", userId)
            .single();

          if (!script) {
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❌ Error", "Script not found or you don't own it.", 0xff0000),
              components: [],
            });
          }

          // Generate a unique key
          const key = generateKey();
          const expiresAt = expiryHours === 0
            ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() // ~100 years = lifetime
            : new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

          // Store key in generated_keys
          const { error: keyInsertError } = await supabase
            .from("generated_keys")
            .insert({
              key,
              script_id: script.id,
              discord_id: targetUserId,
              expires_at: expiresAt,
              redeemed: false,
            });

          if (keyInsertError) {
            console.error("Key insert error:", keyInsertError);
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❌ Error", "Failed to generate key.", 0xff0000),
              components: [],
            });
          }

          const loaderUrl = `https://api.defendlua.lol/s/${script.slug || script.id}`;
          const loadstringCode = `Key = "${key}"\nloadstring(game:HttpGet("${loaderUrl}?redeemkey="..Key))()`;

          // DM the target user
          const botToken = Deno.env.get("DISCORD_BOT_TOKEN");
          if (botToken) {
            try {
              // Create DM channel
              const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
                method: "POST",
                headers: { "Authorization": `Bot ${botToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ recipient_id: targetUserId }),
              });
              const dmChannel = await dmRes.json();

              if (dmChannel.id) {
                const expiryText = formatDuration(expiryHours);
                await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
                  method: "POST",
                  headers: { "Authorization": `Bot ${botToken}`, "Content-Type": "application/json" },
                  body: JSON.stringify({
                    embeds: [{
                      title: "🎉 You've Been Whitelisted!",
                      description: `You have been whitelisted for **${script.script_name}**!\n\n**Your Key:** \`${key}\`\n**Expires:** ${expiryText}\n\nPaste this in your executor:\n\`\`\`lua\n${loadstringCode}\n\`\`\`\n\nOr use \`/redeem key:${key}\` in Discord.`,
                      color: 0x00ff00,
                      footer: { text: "DefendLua Bot" },
                      timestamp: new Date().toISOString(),
                    }],
                  }),
                });
              }
            } catch (err) {
              console.error("Failed to DM user:", err);
            }
          }

          const expiryText = expiryHours === 0 ? "♾️ Lifetime" : `${expiryHours}h`;

          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("✅ User Whitelisted", `<@${targetUserId}> has been whitelisted for **${script.script_name}**! 🎉\n\nThey've been sent the key and loader in their DMs.\n**Expires:** ${expiryText}`, 0x00ff00),
            components: [],
          });
        }

        const { data: script, error: scriptError } = await supabase
          .from("scripts")
          .select("*")
          .eq("id", scriptId)
          .eq("owner_id", userId)
          .single();

        if (scriptError || !script) {
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("❌ Error", "Script not found or you don't own it.", 0xff0000),
            components: [],
          });
        }

        switch (action) {
          // ── stats ──
          case "stats": {
            const { count: totalLogs } = await supabase.from("access_logs").select("*", { count: "exact", head: true }).eq("script_id", script.id);
            const { count: allowedCount } = await supabase.from("access_logs").select("*", { count: "exact", head: true }).eq("script_id", script.id).eq("status", "allowed");
            const { count: deniedCount } = await supabase.from("access_logs").select("*", { count: "exact", head: true }).eq("script_id", script.id).eq("status", "denied");

            const fields = [
              { name: "📜 Script Name", value: script.script_name, inline: true },
              { name: "🌐 Access Mode", value: script.public_access ? "Public" : "Private (Whitelist)", inline: true },
              { name: "✅ Whitelisted HWIDs", value: `${script.hwid_list?.length || 0}`, inline: true },
              { name: "🚫 Blacklisted HWIDs", value: `${script.hwid_blacklist?.length || 0}`, inline: true },
              { name: "📊 Total Access Attempts", value: `${totalLogs || 0}`, inline: true },
              { name: "✅ Allowed", value: `${allowedCount || 0}`, inline: true },
              { name: "❌ Denied", value: `${deniedCount || 0}`, inline: true },
              { name: "🔗 Webhook", value: script.webhook_url ? "Configured ✅" : "Not set", inline: true },
              { name: "📅 Created", value: new Date(script.created_at).toLocaleDateString(), inline: true },
            ];

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed(`📊 Stats: ${script.script_name}`, "Detailed statistics for your script", 0x5865f2, fields),
              components: [],
            });
          }

          // ── info ──
          case "info": {
            const fields = [
              { name: "📜 Name", value: script.script_name, inline: true },
              { name: "🔑 Script Key", value: `\`${script.script_key}\``, inline: true },
              { name: "🆔 Script ID", value: `\`${script.id}\``, inline: false },
              { name: "🌐 Access Mode", value: script.public_access ? "🌐 Public" : "🔒 Private", inline: true },
              { name: "✅ Whitelist", value: `${script.hwid_list?.length || 0} HWIDs`, inline: true },
              { name: "🚫 Blacklist", value: `${script.hwid_blacklist?.length || 0} HWIDs`, inline: true },
              { name: "🌍 IP Whitelist", value: `${script.ip_list?.length || 0} IPs`, inline: true },
              { name: "🔗 Webhook", value: script.webhook_url ? `\`${script.webhook_url.substring(0, 50)}...\`` : "Not set", inline: false },
              { name: "📅 Created", value: new Date(script.created_at).toLocaleDateString(), inline: true },
              { name: "🔄 Updated", value: new Date(script.updated_at).toLocaleDateString(), inline: true },
            ];

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed(`ℹ️ Script Info: ${script.script_name}`, "Full details for your script", 0x5865f2, fields),
              components: [],
            });
          }

          // ── logs ──
          case "logs": {
            const { data: logs } = await supabase
              .from("access_logs")
              .select("hwid, status, reason, ip_address, accessed_at")
              .eq("script_id", script.id)
              .order("accessed_at", { ascending: false })
              .limit(10);

            if (!logs?.length) return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("📋 Access Logs", `No access logs found for **${script.script_name}**.`, 0x5865f2),
              components: [],
            });

            const fields = logs.map((log: any) => ({
              name: `${log.status === "allowed" ? "✅" : "❌"} ${new Date(log.accessed_at).toLocaleString()}`,
              value: `HWID: \`${log.hwid.substring(0, 16)}...\`\nStatus: **${log.status}**${log.reason ? `\nReason: ${log.reason}` : ""}${log.ip_address ? `\nIP: \`${log.ip_address}\`` : ""}`,
              inline: false,
            }));

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed(`📋 Recent Logs: ${script.script_name}`, `Last ${logs.length} access attempt(s)`, 0x5865f2, fields),
              components: [],
            });
          }

          // ── denied ──
          case "denied": {
            const { data: denied } = await supabase
              .from("access_logs")
              .select("hwid, reason, ip_address, accessed_at")
              .eq("script_id", script.id)
              .eq("status", "denied")
              .order("accessed_at", { ascending: false })
              .limit(10);

            if (!denied?.length) return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🛡️ Denied Access", `No denied attempts found for **${script.script_name}**.`, 0x00ff00),
              components: [],
            });

            const fields = denied.map((log: any) => ({
              name: `❌ ${new Date(log.accessed_at).toLocaleString()}`,
              value: `HWID: \`${log.hwid.substring(0, 16)}...\`${log.reason ? `\nReason: **${log.reason}**` : ""}${log.ip_address ? `\nIP: \`${log.ip_address}\`` : ""}`,
              inline: false,
            }));

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed(`🛡️ Denied: ${script.script_name}`, `Last ${denied.length} denied attempt(s)`, 0xff6600, fields),
              components: [],
            });
          }

          // ── keys ──
          case "keys": {
            const { data: keys } = await supabase
              .from("generated_keys")
              .select("key, discord_id, redeemed, redeemed_hwid, expires_at, created_at")
              .eq("script_id", script.id)
              .order("created_at", { ascending: false })
              .limit(15);

            if (!keys?.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
              ...createEmbed("🔑 Keys", `No keys found for **${script.script_name}**.`, 0x5865f2),
              flags: 64,
            });

            const now = new Date();
            const fields = keys.map((k: any) => {
              const expires = new Date(k.expires_at);
              const isExpired = expires < now;
              const isLifetime = (expires.getTime() - new Date(k.created_at).getTime()) > 365 * 24 * 60 * 60 * 1000 * 50;
              const expiryText = isLifetime ? "♾️ Lifetime" : isExpired ? "⏰ Expired" : `${Math.floor((expires.getTime() - now.getTime()) / 3600000)}h left`;
              const status = isExpired ? "🔴" : k.redeemed ? "🟢" : "🟡";
              const hwidText = k.redeemed_hwid ? `||${k.redeemed_hwid.substring(0, 16)}...||` : "Not redeemed";

              return {
                name: `${status} \`${k.key}\``,
                value: `User: <@${k.discord_id}>\nHWID: ${hwidText}\nExpiry: ${expiryText}${k.redeemed ? " ✅ Redeemed" : " 🔓 Unredeemed"}`,
                inline: false,
              };
            });

            return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, {
              ...createEmbed(`🔑 Keys: ${script.script_name}`, `Showing ${keys.length} key(s)`, 0x5865f2, fields),
              flags: 64,
            });
          }

          // ── DESTRUCTIVE ACTIONS → show confirmation ──
          case "delete": {
            return confirmationPrompt("delete", script.id, script.script_name,
              `Are you sure you want to **permanently delete** **${script.script_name}**?\n\nThis will also delete all access logs. This action **cannot be undone**.`);
          }

          case "resetwhitelist": {
            const count = script.hwid_list?.length || 0;
            return confirmationPrompt("resetwhitelist", script.id, script.script_name,
              `Are you sure you want to clear **${count}** HWID(s) from the whitelist of **${script.script_name}**?\n\nThis action **cannot be undone**.`);
          }

          case "resetblacklist": {
            const count = script.hwid_blacklist?.length || 0;
            return confirmationPrompt("resetblacklist", script.id, script.script_name,
              `Are you sure you want to clear **${count}** HWID(s) from the blacklist of **${script.script_name}**?\n\nThis action **cannot be undone**.`);
          }

          // ── toggle ──
          case "toggle": {
            const newAccess = !script.public_access;
            const { error } = await supabase.from("scripts").update({ public_access: newAccess }).eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to toggle access.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🔄 Access Toggled", `**${script.script_name}** is now **${newAccess ? "🌐 Public" : "🔒 Private (Whitelist only)"}**.`, 0x00ff00),
              components: [],
            });
          }

          // ── webhook ──
          case "webhook": {
            const webhookUrl = extraData;
            const isRemove = !webhookUrl || webhookUrl === "__remove__";

            if (isRemove) {
              const { error } = await supabase.from("scripts").update({ webhook_url: null }).eq("id", script.id);
              if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to remove webhook.", 0xff0000), components: [] });

              return reply(InteractionResponseType.UPDATE_MESSAGE, {
                ...createEmbed("🔗 Webhook Removed", `Webhook has been removed from **${script.script_name}**.`, 0x00ff00),
                components: [],
              });
            } else {
              const { error } = await supabase.from("scripts").update({ webhook_url: webhookUrl }).eq("id", script.id);
              if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to set webhook. Make sure the URL is valid.", 0xff0000), components: [] });

              return reply(InteractionResponseType.UPDATE_MESSAGE, {
                ...createEmbed("🔗 Webhook Set", `Webhook for **${script.script_name}** has been updated.\n\`${webhookUrl}\``, 0x00ff00),
                components: [],
              });
            }
          }

          // ── rename ──
          case "rename": {
            const newName = extraData;
            if (!newName) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "No new name provided.", 0xff0000), components: [] });

            const { error } = await supabase.from("scripts").update({ script_name: newName }).eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to rename script.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("✏️ Script Renamed", `**${script.script_name}** → **${newName}**`, 0x00ff00),
              components: [],
            });
          }

          // ── whitelist/unwhitelist/blacklist/unblacklist ──
          case "whitelist":
          case "unwhitelist":
          case "blacklist":
          case "unblacklist": {
            const hwid = extraData;
            if (!hwid) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "No HWID provided.", 0xff0000), components: [] });

            let updateData: any = {};
            let message = "";
            let emoji = "";

            if (action === "whitelist") {
              const list = script.hwid_list || [];
              if (list.includes(hwid)) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("⚠️ Already Whitelisted", "This HWID is already in the whitelist.", 0xffaa00), components: [] });
              updateData.hwid_list = [...list, hwid];
              if (script.hwid_blacklist?.includes(hwid)) updateData.hwid_blacklist = script.hwid_blacklist.filter((h: string) => h !== hwid);
              message = `Added HWID to whitelist for **${script.script_name}**`;
              emoji = "✅";
            } else if (action === "unwhitelist") {
              const list = script.hwid_list || [];
              if (!list.includes(hwid)) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("⚠️ Not Found", "This HWID is not in the whitelist.", 0xffaa00), components: [] });
              updateData.hwid_list = list.filter((h: string) => h !== hwid);
              message = `Removed HWID from whitelist for **${script.script_name}**`;
              emoji = "🗑️";
            } else if (action === "blacklist") {
              const list = script.hwid_blacklist || [];
              if (list.includes(hwid)) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("⚠️ Already Blacklisted", "This HWID is already in the blacklist.", 0xffaa00), components: [] });
              updateData.hwid_blacklist = [...list, hwid];
              if (script.hwid_list?.includes(hwid)) updateData.hwid_list = script.hwid_list.filter((h: string) => h !== hwid);
              message = `Added HWID to blacklist for **${script.script_name}**`;
              emoji = "🚫";
            } else {
              const list = script.hwid_blacklist || [];
              if (!list.includes(hwid)) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("⚠️ Not Found", "This HWID is not in the blacklist.", 0xffaa00), components: [] });
              updateData.hwid_blacklist = list.filter((h: string) => h !== hwid);
              message = `Removed HWID from blacklist for **${script.script_name}**`;
              emoji = "♻️";
            }

            const { error: updateError } = await supabase.from("scripts").update(updateData).eq("id", script.id);
            if (updateError) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to update script.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed(`${emoji} Success`, message, 0x00ff00),
              components: [],
            });
          }

          // ── resetkey ──
          case "resetkey": {
            const payload = JSON.parse(extraData);
            const targetUserId = payload.targetUser;
            const targetHwid = payload.hwid;

            // Find matching keys for this script
            let query = supabase
              .from("generated_keys")
              .select("id, key, redeemed_hwid, discord_id, expires_at, redeemed")
              .eq("script_id", script.id)
              .eq("redeemed", true)
              .not("redeemed_hwid", "is", null);

            if (targetUserId) {
              query = query.eq("discord_id", targetUserId);
            }

            const { data: keys } = await query;

            if (!keys?.length) {
              return reply(InteractionResponseType.UPDATE_MESSAGE, {
                ...createEmbed("⚠️ No Keys Found", `No redeemed keys found${targetUserId ? ` for <@${targetUserId}>` : ""} on **${script.script_name}**.`, 0xffaa00),
                components: [],
              });
            }

            // If searching by HWID, filter to matching keys
            const matchingKeys = targetHwid
              ? keys.filter((k: any) => k.redeemed_hwid === targetHwid)
              : keys;

            if (!matchingKeys.length) {
              return reply(InteractionResponseType.UPDATE_MESSAGE, {
                ...createEmbed("⚠️ No Keys Found", `No keys with HWID \`${targetHwid?.substring(0, 20)}...\` found on **${script.script_name}**.`, 0xffaa00),
                components: [],
              });
            }

            // Reset all matching keys' HWID locks
            let resetCount = 0;
            for (const k of matchingKeys) {
              // Remove HWID from script whitelist
              const currentList = script.hwid_list || [];
              if (k.redeemed_hwid && currentList.includes(k.redeemed_hwid)) {
                const newList = currentList.filter((h: string) => h !== k.redeemed_hwid);
                await supabase.from("scripts").update({ hwid_list: newList }).eq("id", script.id);
                // Refresh script data for next iteration
                script.hwid_list = newList;
              }

              // Clear the HWID lock on the key
              await supabase.from("generated_keys").update({ redeemed_hwid: null, redeemed: false }).eq("id", k.id);
              resetCount++;
            }

            const targetDesc = targetUserId ? `<@${targetUserId}>` : `HWID \`${targetHwid?.substring(0, 20)}...\``;
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🔄 Key HWID Reset", `Reset **${resetCount}** key(s) for ${targetDesc} on **${script.script_name}**.\n\nThe user can now redeem their key again on a new device.`, 0x00ff00),
              components: [],
            });
          }

          // ── removesetup ──
          case "removesetup": {
            const { error: delError } = await supabase
              .from("key_system_configs")
              .delete()
              .eq("script_id", script.id);

            if (delError) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to remove key system.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🗑️ Key System Removed", `Key system has been removed from **${script.script_name}**.`, 0x00ff00),
              components: [],
            });
          }

          default:
            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("❓ Unknown Action", "This action is not recognized.", 0xff0000),
              components: [],
            });
        }
      }
    } catch (error) {
      console.error("Component interaction error:", error);
      return errReply("An unexpected error occurred.");
    }
  }

  return new Response("Unknown interaction type", { status: 400 });
});
