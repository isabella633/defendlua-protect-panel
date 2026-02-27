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
    .select("id, script_name, hwid_list, hwid_blacklist, public_access, webhook_url, created_at, script_key, ip_list")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
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
            { name: "🗑️ /resetwhitelist", value: "Clear all whitelist HWIDs (dropdown)", inline: true },
            { name: "🗑️ /resetblacklist", value: "Clear all blacklist HWIDs (dropdown)", inline: true },
            { name: "✏️ /rename <name>", value: "Rename a script (dropdown)", inline: true },
            { name: "🔄 /toggle", value: "Toggle public/private access (dropdown)", inline: true },
            { name: "🗑️ /delete", value: "Delete a script (dropdown)", inline: true },
            { name: "🔍 /lookup <hwid>", value: "Search HWID across all scripts", inline: true },
          ];
          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📖 DefendLua Bot Commands", "All commands with **(dropdown)** will let you pick a script from a list.", 0x5865f2, fields));
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
            resetwhitelist: "Please select a script to clear its whitelist",
            resetblacklist: "Please select a script to clear its blacklist",
            toggle: "Please select a script to toggle public/private",
            info: "Please select a script to view full details",
            delete: "⚠️ **This action is permanent!** Select a script to delete",
          };

          return scriptSelectMenu(name, scripts, titles[name], descs[name]);
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

      // ── BUTTON: blacklist from webhook ──
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

      // ── SELECT MENU: script selection ──
      if (customId.startsWith("select_script_")) {
        const selectedValue = values[0] || "";
        // value format: "action:scriptId" or "action:scriptId:extraData"
        const parts = selectedValue.split(":");
        const action = parts[0];
        const scriptId = parts[1];
        const extraData = parts.slice(2).join(":"); // rejoin in case extra data has colons

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

          // ── resetwhitelist ──
          case "resetwhitelist": {
            const count = script.hwid_list?.length || 0;
            const { error } = await supabase.from("scripts").update({ hwid_list: [] }).eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to reset whitelist.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🗑️ Whitelist Reset", `Cleared **${count}** HWID(s) from the whitelist of **${script.script_name}**.`, 0x00ff00),
              components: [],
            });
          }

          // ── resetblacklist ──
          case "resetblacklist": {
            const count = script.hwid_blacklist?.length || 0;
            const { error } = await supabase.from("scripts").update({ hwid_blacklist: [] }).eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to reset blacklist.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🗑️ Blacklist Reset", `Cleared **${count}** HWID(s) from the blacklist of **${script.script_name}**.`, 0x00ff00),
              components: [],
            });
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

          // ── delete ──
          case "delete": {
            // Delete access logs first, then the script
            await supabase.from("access_logs").delete().eq("script_id", script.id);
            const { error } = await supabase.from("scripts").delete().eq("id", script.id);
            if (error) return reply(InteractionResponseType.UPDATE_MESSAGE, { ...createEmbed("❌ Error", "Failed to delete script.", 0xff0000), components: [] });

            return reply(InteractionResponseType.UPDATE_MESSAGE, {
              ...createEmbed("🗑️ Script Deleted", `**${script.script_name}** has been permanently deleted.`, 0xff0000),
              components: [],
            });
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
