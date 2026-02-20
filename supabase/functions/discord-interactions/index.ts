import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Discord Interaction Types
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

// Convert hex string to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Verify Discord signature using Web Crypto API
async function verifySignature(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> {
  try {
    const publicKeyBytes = hexToUint8Array(publicKey);
    const signatureBytes = hexToUint8Array(signature);
    const message = new TextEncoder().encode(timestamp + body);

    // Import the public key
    const key = await crypto.subtle.importKey(
      "raw",
      publicKeyBytes,
      { name: "Ed25519" },
      false,
      ["verify"]
    );

    // Verify the signature
    return await crypto.subtle.verify("Ed25519", key, signatureBytes, message);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Create embed response
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

Deno.serve(async (req) => {
  const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");
  
  if (!DISCORD_PUBLIC_KEY) {
    console.error("DISCORD_PUBLIC_KEY not configured");
    return new Response("Server configuration error", { status: 500 });
  }

  // Get signature headers
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return new Response("Missing signature headers", { status: 401 });
  }

  // Get raw body for verification
  const body = await req.text();

  // Verify the request signature
  const isValid = await verifySignature(DISCORD_PUBLIC_KEY, signature, timestamp, body);
  
  if (!isValid) {
    console.error("Invalid signature");
    return new Response("Invalid request signature", { status: 401 });
  }

  // Parse the verified body
  const interaction = JSON.parse(body);
  console.log("Received interaction:", interaction.type, interaction.data?.name);

  // Handle PING (Discord endpoint verification)
  if (interaction.type === InteractionType.PING) {
    console.log("Responding to PING");
    return new Response(
      JSON.stringify({ type: InteractionResponseType.PONG }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Handle slash commands
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = interaction.data;
    const discordId = interaction.member?.user?.id || interaction.user?.id;
    const discordUsername = interaction.member?.user?.username || interaction.user?.username;

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      switch (name) {
        case "link": {
          const code = options?.find((o: { name: string }) => o.name === "code")?.value;
          
          if (!code) {
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("❌ Error", "Please provide a link code.", 0xff0000),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

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
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("❌ Invalid Code", "The code is invalid or has expired.", 0xff0000),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          // Check if Discord is already linked
          const { data: existingLink } = await supabase
            .from("discord_links")
            .select("*")
            .eq("discord_id", discordId)
            .single();

          if (existingLink) {
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("❌ Already Linked", "Your Discord account is already linked to another DefendLua account.", 0xff0000),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          // Create the link
          const { error: linkError } = await supabase
            .from("discord_links")
            .upsert({
              user_id: linkCode.user_id,
              discord_id: discordId,
              discord_username: discordUsername,
              linked_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

          if (linkError) {
            console.error("Link error:", linkError);
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("❌ Error", "Failed to link your account. Please try again.", 0xff0000),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          // Mark code as used
          await supabase
            .from("discord_link_codes")
            .update({ used: true })
            .eq("id", linkCode.id);

          // Get username
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", linkCode.user_id)
            .single();

          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: createEmbed(
                "✅ Account Linked!",
                `Successfully linked to DefendLua account: **${profile?.username || "Unknown"}**`,
                0x00ff00
              ),
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        case "scripts": {
          // Get user from Discord link
          const { data: link, error: linkError } = await supabase
            .from("discord_links")
            .select("user_id")
            .eq("discord_id", discordId)
            .single();

          if (linkError || !link) {
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("❌ Not Linked", "Your Discord account is not linked. Use `/link <code>` to link your account.", 0xff0000),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          // Get scripts
          const { data: scripts, error: scriptsError } = await supabase
            .from("scripts")
            .select("script_name, hwid_list, hwid_blacklist")
            .eq("owner_id", link.user_id)
            .order("created_at", { ascending: false });

          if (scriptsError || !scripts?.length) {
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("📋 Your Scripts", "You don't have any scripts yet.", 0x5865f2),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          const fields = scripts.slice(0, 10).map((s) => ({
            name: `📜 ${s.script_name}`,
            value: `Whitelisted: ${s.hwid_list?.length || 0} | Blacklisted: ${s.hwid_blacklist?.length || 0}`,
            inline: true,
          }));

          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: createEmbed("📋 Your Scripts", `You have ${scripts.length} script(s)`, 0x5865f2, fields),
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        case "whitelist":
        case "unwhitelist":
        case "blacklist":
        case "unblacklist": {
          const scriptName = options?.find((o: { name: string }) => o.name === "script")?.value;
          const hwid = options?.find((o: { name: string }) => o.name === "hwid")?.value;

          if (!scriptName || !hwid) {
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("❌ Error", "Please provide both script name and HWID.", 0xff0000),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          // Get user from Discord link
          const { data: link, error: linkError } = await supabase
            .from("discord_links")
            .select("user_id")
            .eq("discord_id", discordId)
            .single();

          if (linkError || !link) {
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("❌ Not Linked", "Your Discord account is not linked. Use `/link <code>` to link your account.", 0xff0000),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          // Find script
          const { data: script, error: scriptError } = await supabase
            .from("scripts")
            .select("*")
            .eq("owner_id", link.user_id)
            .ilike("script_name", scriptName)
            .single();

          if (scriptError || !script) {
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("❌ Not Found", `Script "${scriptName}" not found.`, 0xff0000),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          let updateData: { hwid_list?: string[]; hwid_blacklist?: string[] } = {};
          let message = "";
          let emoji = "";

          if (name === "whitelist") {
            const currentList = script.hwid_list || [];
            if (currentList.includes(hwid)) {
              return new Response(
                JSON.stringify({
                  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data: createEmbed("⚠️ Already Whitelisted", "This HWID is already in the whitelist.", 0xffaa00),
                }),
                { headers: { "Content-Type": "application/json" } }
              );
            }
            updateData.hwid_list = [...currentList, hwid];
            if (script.hwid_blacklist?.includes(hwid)) {
              updateData.hwid_blacklist = script.hwid_blacklist.filter((h: string) => h !== hwid);
            }
            message = `Added HWID to whitelist for **${script.script_name}**`;
            emoji = "✅";
          } else if (name === "unwhitelist") {
            const currentList = script.hwid_list || [];
            if (!currentList.includes(hwid)) {
              return new Response(
                JSON.stringify({
                  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data: createEmbed("⚠️ Not Found", "This HWID is not in the whitelist.", 0xffaa00),
                }),
                { headers: { "Content-Type": "application/json" } }
              );
            }
            updateData.hwid_list = currentList.filter((h: string) => h !== hwid);
            message = `Removed HWID from whitelist for **${script.script_name}**`;
            emoji = "🗑️";
          } else if (name === "blacklist") {
            const currentList = script.hwid_blacklist || [];
            if (currentList.includes(hwid)) {
              return new Response(
                JSON.stringify({
                  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data: createEmbed("⚠️ Already Blacklisted", "This HWID is already in the blacklist.", 0xffaa00),
                }),
                { headers: { "Content-Type": "application/json" } }
              );
            }
            updateData.hwid_blacklist = [...currentList, hwid];
            if (script.hwid_list?.includes(hwid)) {
              updateData.hwid_list = script.hwid_list.filter((h: string) => h !== hwid);
            }
            message = `Added HWID to blacklist for **${script.script_name}**`;
            emoji = "🚫";
          } else if (name === "unblacklist") {
            const currentList = script.hwid_blacklist || [];
            if (!currentList.includes(hwid)) {
              return new Response(
                JSON.stringify({
                  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data: createEmbed("⚠️ Not Found", "This HWID is not in the blacklist.", 0xffaa00),
                }),
                { headers: { "Content-Type": "application/json" } }
              );
            }
            updateData.hwid_blacklist = currentList.filter((h: string) => h !== hwid);
            message = `Removed HWID from blacklist for **${script.script_name}**`;
            emoji = "♻️";
          }

          // Update script
          const { error: updateError } = await supabase
            .from("scripts")
            .update(updateData)
            .eq("id", script.id);

          if (updateError) {
            return new Response(
              JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: createEmbed("❌ Error", "Failed to update script.", 0xff0000),
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: createEmbed(`${emoji} Success`, message, 0x00ff00),
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        default:
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: createEmbed("❓ Unknown Command", "This command is not recognized.", 0xff0000),
            }),
            { headers: { "Content-Type": "application/json" } }
          );
      }
    } catch (error) {
      console.error("Command error:", error);
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: createEmbed("❌ Error", "An unexpected error occurred.", 0xff0000),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Handle button interactions (e.g., "Blacklist this HWID" from webhook messages)
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId = interaction.data?.custom_id || "";
    const discordId = interaction.member?.user?.id || interaction.user?.id;

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      if (customId.startsWith("blacklist_")) {
        const hwid = customId.replace("blacklist_", "");

        // Get user from Discord link
        const { data: link, error: linkError } = await supabase
          .from("discord_links")
          .select("user_id")
          .eq("discord_id", discordId)
          .single();

        if (linkError || !link) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: createEmbed("❌ Not Linked", "Your Discord account is not linked to DefendLua.", 0xff0000),
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        // Try to find which script this HWID accessed by checking the embed in the message
        const embedFields = interaction.message?.embeds?.[0]?.fields || [];
        const scriptIdField = embedFields.find((f: { name: string }) => f.name === "Script ID");
        const scriptId = scriptIdField?.value?.replace(/`/g, "");

        if (!scriptId) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: createEmbed("❌ Error", "Could not determine the script. Please use `/blacklist` command instead.", 0xff0000),
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        // Verify script ownership
        const { data: script, error: scriptError } = await supabase
          .from("scripts")
          .select("id, script_name, hwid_blacklist, hwid_list")
          .eq("id", scriptId)
          .eq("owner_id", link.user_id)
          .single();

        if (scriptError || !script) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: createEmbed("❌ Access Denied", "You don't own this script.", 0xff0000),
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        const currentBlacklist = script.hwid_blacklist || [];
        if (currentBlacklist.includes(hwid)) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.UPDATE_MESSAGE,
              data: {
                ...createEmbed("⚠️ Already Blacklisted", `HWID \`${hwid}\` is already blacklisted on **${script.script_name}**.`, 0xffaa00),
                components: [],
              },
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        // Add to blacklist and remove from whitelist
        const updateData: { hwid_blacklist: string[]; hwid_list?: string[] } = {
          hwid_blacklist: [...currentBlacklist, hwid],
        };
        if (script.hwid_list?.includes(hwid)) {
          updateData.hwid_list = script.hwid_list.filter((h: string) => h !== hwid);
        }

        const { error: updateError } = await supabase
          .from("scripts")
          .update(updateData)
          .eq("id", script.id);

        if (updateError) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: createEmbed("❌ Error", "Failed to blacklist HWID.", 0xff0000),
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        // Update the original message to remove the button and show success
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.UPDATE_MESSAGE,
            data: {
              ...createEmbed("🚫 HWID Blacklisted", `Successfully blacklisted \`${hwid}\` on **${script.script_name}**.`, 0xff0000),
              components: [],
            },
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.error("Button interaction error:", error);
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: createEmbed("❌ Error", "An unexpected error occurred.", 0xff0000),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Unknown interaction type", { status: 400 });
});