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

// Helper: get user_id from discord_id
async function getUserId(supabase: any, discordId: string) {
  const { data, error } = await supabase
    .from("discord_links")
    .select("user_id")
    .eq("discord_id", discordId)
    .single();
  if (error || !data) return null;
  return data.user_id;
}

// Helper: find script by name for a user
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
  console.log("Received interaction:", interaction.type, interaction.data?.name);

  if (interaction.type === InteractionType.PING) {
    return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), { headers: { "Content-Type": "application/json" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const discordId = interaction.member?.user?.id || interaction.user?.id;
  const discordUsername = interaction.member?.user?.username || interaction.user?.username;

  // ─── SLASH COMMANDS ───
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = interaction.data;
    const getOpt = (n: string) => options?.find((o: { name: string }) => o.name === n)?.value;

    try {
      switch (name) {
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

          const { data: scripts } = await supabase
            .from("scripts")
            .select("script_name, hwid_list, hwid_blacklist, public_access")
            .eq("owner_id", userId)
            .order("created_at", { ascending: false });

          if (!scripts?.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📋 Your Scripts", "You don't have any scripts yet.", 0x5865f2));

          const fields = scripts.slice(0, 15).map((s: any) => ({
            name: `📜 ${s.script_name}`,
            value: `WL: ${s.hwid_list?.length || 0} | BL: ${s.hwid_blacklist?.length || 0} | ${s.public_access ? '🌐 Public' : '🔒 Private'}`,
            inline: true,
          }));

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📋 Your Scripts", `You have **${scripts.length}** script(s)`, 0x5865f2, fields));
        }

        // ── /whitelist /unwhitelist /blacklist /unblacklist ──
        case "whitelist":
        case "unwhitelist":
        case "blacklist":
        case "unblacklist": {
          const scriptName = getOpt("script");
          const hwid = getOpt("hwid");
          if (!scriptName || !hwid) return errReply("Please provide both script name and HWID.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const script = await findScript(supabase, userId, scriptName);
          if (!script) return errReply(`Script "${scriptName}" not found.`);

          let updateData: any = {};
          let message = "";
          let emoji = "";

          if (name === "whitelist") {
            const list = script.hwid_list || [];
            if (list.includes(hwid)) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, createEmbed("⚠️ Already Whitelisted", "This HWID is already in the whitelist.", 0xffaa00));
            updateData.hwid_list = [...list, hwid];
            if (script.hwid_blacklist?.includes(hwid)) updateData.hwid_blacklist = script.hwid_blacklist.filter((h: string) => h !== hwid);
            message = `Added HWID to whitelist for **${script.script_name}**`;
            emoji = "✅";
          } else if (name === "unwhitelist") {
            const list = script.hwid_list || [];
            if (!list.includes(hwid)) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, createEmbed("⚠️ Not Found", "This HWID is not in the whitelist.", 0xffaa00));
            updateData.hwid_list = list.filter((h: string) => h !== hwid);
            message = `Removed HWID from whitelist for **${script.script_name}**`;
            emoji = "🗑️";
          } else if (name === "blacklist") {
            const list = script.hwid_blacklist || [];
            if (list.includes(hwid)) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, createEmbed("⚠️ Already Blacklisted", "This HWID is already in the blacklist.", 0xffaa00));
            updateData.hwid_blacklist = [...list, hwid];
            if (script.hwid_list?.includes(hwid)) updateData.hwid_list = script.hwid_list.filter((h: string) => h !== hwid);
            message = `Added HWID to blacklist for **${script.script_name}**`;
            emoji = "🚫";
          } else {
            const list = script.hwid_blacklist || [];
            if (!list.includes(hwid)) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, createEmbed("⚠️ Not Found", "This HWID is not in the blacklist.", 0xffaa00));
            updateData.hwid_blacklist = list.filter((h: string) => h !== hwid);
            message = `Removed HWID from blacklist for **${script.script_name}**`;
            emoji = "♻️";
          }

          const { error: updateError } = await supabase.from("scripts").update(updateData).eq("id", script.id);
          if (updateError) return errReply("Failed to update script.");

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, createEmbed(`${emoji} Success`, message, 0x00ff00));
        }

        // ── /stats ──
        case "stats": {
          const scriptName = getOpt("script");
          if (!scriptName) return errReply("Please provide a script name.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const script = await findScript(supabase, userId, scriptName);
          if (!script) return errReply(`Script "${scriptName}" not found.`);

          // Get access log counts
          const { count: totalLogs } = await supabase
            .from("access_logs")
            .select("*", { count: "exact", head: true })
            .eq("script_id", script.id);

          const { count: allowedCount } = await supabase
            .from("access_logs")
            .select("*", { count: "exact", head: true })
            .eq("script_id", script.id)
            .eq("status", "allowed");

          const { count: deniedCount } = await supabase
            .from("access_logs")
            .select("*", { count: "exact", head: true })
            .eq("script_id", script.id)
            .eq("status", "denied");

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

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed(`📊 Stats: ${script.script_name}`, "Detailed statistics for your script", 0x5865f2, fields));
        }

        // ── /resetwhitelist ──
        case "resetwhitelist": {
          const scriptName = getOpt("script");
          if (!scriptName) return errReply("Please provide a script name.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const script = await findScript(supabase, userId, scriptName);
          if (!script) return errReply(`Script "${scriptName}" not found.`);

          const count = script.hwid_list?.length || 0;
          const { error } = await supabase.from("scripts").update({ hwid_list: [] }).eq("id", script.id);
          if (error) return errReply("Failed to reset whitelist.");

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("🗑️ Whitelist Reset", `Cleared **${count}** HWID(s) from the whitelist of **${script.script_name}**.`, 0x00ff00));
        }

        // ── /resetblacklist ──
        case "resetblacklist": {
          const scriptName = getOpt("script");
          if (!scriptName) return errReply("Please provide a script name.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const script = await findScript(supabase, userId, scriptName);
          if (!script) return errReply(`Script "${scriptName}" not found.`);

          const count = script.hwid_blacklist?.length || 0;
          const { error } = await supabase.from("scripts").update({ hwid_blacklist: [] }).eq("id", script.id);
          if (error) return errReply("Failed to reset blacklist.");

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("🗑️ Blacklist Reset", `Cleared **${count}** HWID(s) from the blacklist of **${script.script_name}**.`, 0x00ff00));
        }

        // ── /rename ──
        case "rename": {
          const scriptName = getOpt("script");
          const newName = getOpt("name");
          if (!scriptName || !newName) return errReply("Please provide both current and new script name.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const script = await findScript(supabase, userId, scriptName);
          if (!script) return errReply(`Script "${scriptName}" not found.`);

          const { error } = await supabase.from("scripts").update({ script_name: newName }).eq("id", script.id);
          if (error) return errReply("Failed to rename script.");

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("✏️ Script Renamed", `**${script.script_name}** → **${newName}**`, 0x00ff00));
        }

        // ── /logs ──
        case "logs": {
          const scriptName = getOpt("script");
          if (!scriptName) return errReply("Please provide a script name.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const script = await findScript(supabase, userId, scriptName);
          if (!script) return errReply(`Script "${scriptName}" not found.`);

          const { data: logs } = await supabase
            .from("access_logs")
            .select("hwid, status, reason, ip_address, accessed_at")
            .eq("script_id", script.id)
            .order("accessed_at", { ascending: false })
            .limit(10);

          if (!logs?.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("📋 Access Logs", `No access logs found for **${script.script_name}**.`, 0x5865f2));

          const fields = logs.map((log: any, i: number) => ({
            name: `${log.status === "allowed" ? "✅" : "❌"} ${new Date(log.accessed_at).toLocaleString()}`,
            value: `HWID: \`${log.hwid.substring(0, 16)}...\`\nStatus: **${log.status}**${log.reason ? `\nReason: ${log.reason}` : ""}${log.ip_address ? `\nIP: \`${log.ip_address}\`` : ""}`,
            inline: false,
          }));

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed(`📋 Recent Logs: ${script.script_name}`, `Last ${logs.length} access attempt(s)`, 0x5865f2, fields));
        }

        // ── /denied ──
        case "denied": {
          const scriptName = getOpt("script");
          if (!scriptName) return errReply("Please provide a script name.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const script = await findScript(supabase, userId, scriptName);
          if (!script) return errReply(`Script "${scriptName}" not found.`);

          const { data: denied } = await supabase
            .from("access_logs")
            .select("hwid, reason, ip_address, accessed_at")
            .eq("script_id", script.id)
            .eq("status", "denied")
            .order("accessed_at", { ascending: false })
            .limit(10);

          if (!denied?.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed("🛡️ Denied Access", `No denied attempts found for **${script.script_name}**.`, 0x00ff00));

          const fields = denied.map((log: any) => ({
            name: `❌ ${new Date(log.accessed_at).toLocaleString()}`,
            value: `HWID: \`${log.hwid.substring(0, 16)}...\`${log.reason ? `\nReason: **${log.reason}**` : ""}${log.ip_address ? `\nIP: \`${log.ip_address}\`` : ""}`,
            inline: false,
          }));

          return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            createEmbed(`🛡️ Denied: ${script.script_name}`, `Last ${denied.length} denied attempt(s)`, 0xff6600, fields));
        }

        // ── /lookup ──
        case "lookup": {
          const hwid = getOpt("hwid");
          if (!hwid) return errReply("Please provide an HWID to look up.");

          const userId = await getUserId(supabase, discordId);
          if (!userId) return notLinkedReply();

          const { data: scripts } = await supabase
            .from("scripts")
            .select("script_name, hwid_list, hwid_blacklist")
            .eq("owner_id", userId);

          if (!scripts?.length) return reply(InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
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
            createEmbed("❓ Unknown Command", "This command is not recognized.", 0xff0000));
      }
    } catch (error) {
      console.error("Command error:", error);
      return errReply("An unexpected error occurred.");
    }
  }

  // ─── BUTTON INTERACTIONS ───
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId = interaction.data?.custom_id || "";

    try {
      if (customId.startsWith("blacklist_")) {
        const hwid = customId.replace("blacklist_", "");

        const userId = await getUserId(supabase, discordId);
        if (!userId) return notLinkedReply();

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
    } catch (error) {
      console.error("Button interaction error:", error);
      return errReply("An unexpected error occurred.");
    }
  }

  return new Response("Unknown interaction type", { status: 400 });
});