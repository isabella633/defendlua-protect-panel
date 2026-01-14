/**
 * DefendLua Discord Bot
 * 
 * This bot allows users to manage their script whitelists/blacklists via Discord.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install Node.js 18+
 * 2. Run: npm init -y
 * 3. Run: npm install discord.js
 * 4. Create a .env file with:
 *    DISCORD_BOT_TOKEN=your_bot_token_here
 *    API_URL=https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/discord-bot-api
 * 5. Run: node bot.js
 * 
 * DISCORD DEVELOPER PORTAL SETUP:
 * 1. Go to https://discord.com/developers/applications
 * 2. Select your bot application
 * 3. Go to "Bot" section and ensure these intents are enabled:
 *    - MESSAGE CONTENT INTENT
 * 4. Go to OAuth2 > URL Generator
 * 5. Select scopes: bot, applications.commands
 * 6. Select permissions: Send Messages, Use Slash Commands
 * 7. Use the generated URL to invite the bot to your server
 */

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Configuration - Update these values
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const API_URL = process.env.API_URL || 'https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/discord-bot-api';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Slash commands definition
const commands = [
  new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account to your DefendLua account')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The 6-character link code from the website')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('scripts')
    .setDescription('List all your scripts'),
  new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Add an HWID to a script whitelist')
    .addStringOption(option =>
      option.setName('script')
        .setDescription('The name of your script')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('hwid')
        .setDescription('The HWID to whitelist')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('unwhitelist')
    .setDescription('Remove an HWID from a script whitelist')
    .addStringOption(option =>
      option.setName('script')
        .setDescription('The name of your script')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('hwid')
        .setDescription('The HWID to remove')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Add an HWID to a script blacklist')
    .addStringOption(option =>
      option.setName('script')
        .setDescription('The name of your script')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('hwid')
        .setDescription('The HWID to blacklist')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('unblacklist')
    .setDescription('Remove an HWID from a script blacklist')
    .addStringOption(option =>
      option.setName('script')
        .setDescription('The name of your script')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('hwid')
        .setDescription('The HWID to remove')
        .setRequired(true)
    ),
].map(command => command.toJSON());

// API helper function
async function callAPI(action, data) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bot-token': BOT_TOKEN,
      },
      body: JSON.stringify({ action, ...data }),
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Failed to connect to API' };
  }
}

// Register slash commands when bot is ready
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  
  // Register slash commands globally
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  
  try {
    console.log('🔄 Refreshing slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;
  
  // Defer reply to prevent timeout
  await interaction.deferReply({ ephemeral: true });

  try {
    switch (commandName) {
      case 'link': {
        const code = interaction.options.getString('code');
        const result = await callAPI('verify_code', {
          code,
          discord_id: user.id,
          discord_username: user.tag,
        });

        if (result.success) {
          const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ Account Linked!')
            .setDescription(result.message)
            .setTimestamp();
          await interaction.editReply({ embeds: [embed] });
        } else {
          const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Link Failed')
            .setDescription(result.error)
            .setTimestamp();
          await interaction.editReply({ embeds: [embed] });
        }
        break;
      }

      case 'scripts': {
        const result = await callAPI('get_scripts', {
          discord_id: user.id,
        });

        if (result.success) {
          if (result.scripts.length === 0) {
            const embed = new EmbedBuilder()
              .setColor(0xFFFF00)
              .setTitle('📜 Your Scripts')
              .setDescription('You have no scripts yet. Create one on the website!')
              .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
          } else {
            const scriptList = result.scripts.map((s, i) => 
              `**${i + 1}. ${s.name}**\n` +
              `   ✅ Whitelist: ${s.whitelist_count} | ❌ Blacklist: ${s.blacklist_count}`
            ).join('\n\n');

            const embed = new EmbedBuilder()
              .setColor(0x5865F2)
              .setTitle('📜 Your Scripts')
              .setDescription(scriptList)
              .setFooter({ text: `Total: ${result.scripts.length} scripts` })
              .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
          }
        } else {
          const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Error')
            .setDescription(result.error)
            .setTimestamp();
          await interaction.editReply({ embeds: [embed] });
        }
        break;
      }

      case 'whitelist':
      case 'unwhitelist':
      case 'blacklist':
      case 'unblacklist': {
        const script = interaction.options.getString('script');
        const hwid = interaction.options.getString('hwid');
        
        const result = await callAPI(commandName, {
          discord_id: user.id,
          script_name: script,
          hwid,
        });

        if (result.success) {
          const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ Success')
            .setDescription(result.message)
            .setTimestamp();
          await interaction.editReply({ embeds: [embed] });
        } else {
          const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Error')
            .setDescription(result.error)
            .setTimestamp();
          await interaction.editReply({ embeds: [embed] });
        }
        break;
      }
    }
  } catch (error) {
    console.error('Command error:', error);
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Error')
      .setDescription('An unexpected error occurred. Please try again.')
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
});

// Login to Discord
client.login(BOT_TOKEN);
