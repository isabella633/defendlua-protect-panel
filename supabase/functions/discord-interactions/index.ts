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

// Get scripts that have key system enabled (for /getkey - any user)
async function getKeySystemScripts(supabase: any) {
  const { data } = await supabase
    .from("key_system_configs")
    .select("script_id, provider, provider_link, key_expiry_hours, redeem_action, scripts:script_id(id, script_name, owner_id)")
    .eq("enabled", true);
  return data || [];
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
            { name: "✅ /whitelist <hwid>", value: "Add HWID to whitelist (dropdown)", inline: true },
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
            { name: "✅ /redeem <key> <hwid>", value: "Redeem a key to get access", inline: true },
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
          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const scripts = await getUserScripts(supabase, userId);

          if (!scripts.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📋 Your Scripts", "You don't have any scripts yet.", 0x5865f2));

          const fields = scripts.slice(0, 15).map((s: any) => ({
            name: `📜 ${s.script_name}`,
            value: `WL: ${s.hwid_list?.length || 0} | BL: ${s.hwid_blacklist?.length || 0} | ${s.public_access ? '🌐 Public' : '🔒 Private'}`,
            inline: true,
          }));

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📋 Your Scripts", `You have **${scripts.length}** script(s)`, 0x5865f2, fields));
        }

        // ── SELECT MENU COMMANDS (show dropdown to pick script) ──
        case "stats":
        case "logs":
        case "denied":
        case "resetwhitelist":
        case "resetblacklist":
        case "toggle":
        case "info":
        case "delete": {
          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("You don't have any scripts yet.");

          const titles: Record<string, string> = {
            stats: "📊 Select a script",
            logs: "📋 Select a script",
            denied: "🛡️ Select a script",
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

        // ── HWID commands with select menu ──
        case "whitelist":
        case "unwhitelist":
        case "blacklist":
        case "unblacklist": {
          const hwid = getOpt("hwid");
          if (!hwid) return errReply("Please provide an HWID.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const scripts = await getUserScripts(supabase, userId);
          if (!scripts.length) return errReply("You don't have any scripts yet.");

          const actionLabels: Record<string, string> = {
            whitelist: "✅ Select a script to whitelist HWID",
            unwhitelist: "🗑️ Select a script to unwhitelist HWID",
            blacklist: "🚫 Select a script to blacklist HWID",
            unblacklist: "♻️ Select a script to unblacklist HWID",
          };

          return scriptSelectMenu(name, scripts, actionLabels[name], `HWID: \`${hwid.substring(0, 40)}\`\nSelect the script below.`, hwid);
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

        // ── /lookup ──
        case "lookup": {
          const hwid = getOpt("hwid");
          if (!hwid) return errReply("Please provide an HWID to look up.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

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
          const expiry = getOpt("expiry") || 24;
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
            createEmbed("🔑 Key System Configured!", `**${script.script_name}** now has a key system!\n\n**Provider:** ${provider}\n**Link:** ${link}\n**Key Expiry:** ${expiry}h\n**Redeem Action:** ${mode}\n\nUsers can now use \`/getkey\` to get a key!`, 0x00ff00));
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

        // ── /getkey (any user: get a key by completing a link) ──
        case "getkey": {
          const keyScripts = await getKeySystemScripts(supabase);

          if (!keyScripts.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            { ...createEmbed("🔑 No Key Systems", "No scripts have a key system configured yet.", 0xffaa00), flags: 64 });

          const options = keyScripts.slice(0, 25).map((ks: any) => ({
            label: ks.scripts?.script_name?.substring(0, 100) || "Unknown",
            description: `Provider: ${ks.provider} | Expires: ${ks.key_expiry_hours}h`,
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

        // ── /redeem (any user: redeem a key) ──
        case "redeem": {
          const key = getOpt("key");
          const hwid = getOpt("hwid");
          if (!key || !hwid) return errReply("Please provide both a key and your HWID.");

          // Look up the key
          const { data: keyData, error: keyError } = await supabase
            .from("generated_keys")
            .select("*, scripts:script_id(id, script_name, hwid_list, hwid_blacklist, public_access)")
            .eq("key", key.toUpperCase().trim())
            .single();

          if (keyError || !keyData) return errReply("Invalid key. Please check and try again.");
          if (keyData.redeemed) return errReply("This key has already been redeemed.");
          if (new Date(keyData.expires_at) < new Date()) return errReply("This key has expired. Use `/getkey` to get a new one.");

          // Get key system config
          const { data: config } = await supabase
            .from("key_system_configs")
            .select("redeem_action")
            .eq("script_id", keyData.script_id)
            .single();

          const script = keyData.scripts;
          if (!script) return errReply("Script not found.");

          // Check if HWID is blacklisted
          if (script.hwid_blacklist?.includes(hwid)) return errReply("Your HWID is blacklisted on this script.");

          // Perform the redeem action
          if (config?.redeem_action === "whitelist") {
            const currentList = script.hwid_list || [];
            if (!currentList.includes(hwid)) {
              await supabase.from("scripts").update({ hwid_list: [...currentList, hwid] }).eq("id", script.id);
            }
          }

          // Mark key as redeemed
          await supabase.from("generated_keys").update({
            redeemed: true,
            redeemed_at: new Date().toISOString(),
            redeemed_hwid: hwid,
          }).eq("id", keyData.id);

          const actionMsg = config?.redeem_action === "whitelist"
            ? `Your HWID has been **whitelisted** on **${script.script_name}**.`
            : `You have been granted **temporary access** to **${script.script_name}** (expires in ${Math.round((new Date(keyData.expires_at).getTime() - Date.now()) / 3600000)}h).`;

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("✅ Key Redeemed!", actionMsg, 0x00ff00));
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
      const userId = await getUserId(supabase, discordId);
      if (!userId) return notLinkedReply();

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

      // ── BUTTON: getkey complete (user says they completed the link) ──
      if (customId.startsWith("getkey_complete:")) {
        const parts = customId.replace("getkey_complete:", "").split(":");
        const scriptId = parts[0];
        const verifyToken = parts[1];

        // Check verification status in the database
        const { data: verification } = await supabase
          .from("key_link_verifications")
          .select("*")
          .eq("token", verifyToken)
          .eq("discord_id", discordId)
          .eq("script_id", scriptId)
          .single();

        if (!verification) {
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("❌ Error", "Verification session not found. Use `/getkey` again.", 0xff0000),
            flags: 64,
            components: [],
          });
        }

        // Check if they actually completed the verification page
        if (!verification.completed) {
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("🚫 Bypass Detected", "You **have not completed** the link task yet!\n\n⚠️ You must:\n1. Click the verification link\n2. Open the provider link\n3. Complete the full task\n4. Click \"Verify Now\" on the page\n\n**Do not attempt to bypass the key system.**", 0xff0000),
            flags: 64,
            components: [{
              type: ComponentType.ACTION_ROW,
              components: [{
                type: ComponentType.BUTTON,
                style: ButtonStyle.SUCCESS,
                label: "✅ I completed the link — Give me my key",
                custom_id: `getkey_complete:${scriptId}:${verifyToken}`,
              }],
            }],
          });
        }

        // Verified! Now generate the key
        const { data: config } = await supabase
          .from("key_system_configs")
          .select("*, scripts:script_id(script_name)")
          .eq("script_id", scriptId)
          .eq("enabled", true)
          .single();

        if (!config) {
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("❌ Error", "Key system is no longer available for this script.", 0xff0000),
            flags: 64,
            components: [],
          });
        }

        // Generate key
        const key = generateKey();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + config.key_expiry_hours);

        const { error: insertError } = await supabase
          .from("generated_keys")
          .insert({
            script_id: scriptId,
            key,
            discord_id: discordId,
            expires_at: expiresAt.toISOString(),
          });

        if (insertError) {
          console.error("Key generation error:", insertError);
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("❌ Error", "Failed to generate key. Please try again.", 0xff0000),
            flags: 64,
            components: [],
          });
        }

        // Clean up verification record
        await supabase.from("key_link_verifications").delete().eq("id", verification.id);

        return reply(InteractionResponseType.UPDATE_MESSAGE, {
          ...createEmbed("🔑 Your Key", `**Script:** ${config.scripts?.script_name}\n\n🔑 **Your Key:**\n\`${key}\`\n\n⏰ **Expires:** <t:${Math.floor(expiresAt.getTime() / 1000)}:R>\n\nUse \`/redeem ${key} <your_hwid>\` to activate!`, 0x00ff00),
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
              components: [],
            });
          }

          // Show the link and a "I completed it" button
          return reply(InteractionResponseType.UPDATE_MESSAGE, {
            ...createEmbed("🔑 Complete the Link", `**Script:** ${config.scripts?.script_name}\n**Provider:** ${config.provider}\n\n🔗 **Complete this link:**\n${config.provider_link}\n\nAfter completing, click the button below to receive your key.`, 0x5865f2),
            components: [{
              type: ComponentType.ACTION_ROW,
              components: [{
                type: ComponentType.BUTTON,
                style: ButtonStyle.SUCCESS,
                label: "✅ I completed the link — Give me my key",
                custom_id: `getkey_complete:${scriptId}`,
              }],
            }],
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
