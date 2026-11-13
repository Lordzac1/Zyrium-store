import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

export const DISCORD_CONFIG = {
  GUILD_ID: '1557584377506963537',
  RECRUITMENT_CHANNEL_ID: '1570742963791859742',
  TICKET_LOGS_CHANNEL_ID: '1570743379619483708',
  ADMIN_ROLE_ID: '1570743525593714738',
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`🤖 Bot ZYRIUM MC online como ${c.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
