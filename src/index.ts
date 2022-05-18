import { Client, Intents } from "discord.js";

import { createBots } from "./utils/createBots";
import { setDiscordMessagesListener } from "./utils/setDiscordMessagesListener";
import { config } from "../config";
import { botInstancesCount } from "./const";

void (async () => {
  const { discord_token } = config;
  const bots = await createBots(botInstancesCount);

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  });

  setDiscordMessagesListener(client, bots);

  client.once("ready", () => {
    console.log("Bot is ready");
  });

  client.login(discord_token);
})();
