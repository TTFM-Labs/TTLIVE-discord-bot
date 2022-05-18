import { Message } from "discord.js";
import { checkBotKey } from "../utils/checkBotKey";

import { IBots } from "../utils/createBots";

export const onConnectHandler = (
  bots: IBots,
  message: Message,
  args: string[] | undefined
): void => {
  if (!args || args.length < 2) {
    message.reply("Invalid command");

    return;
  }

  message.reply("Bot is connecting...");

  const [botNumber, roomSlug] = args;

  const roomPassword = args[2] ? args[2] : null;

  const isValidKey = checkBotKey(botNumber, bots, message);

  if (!isValidKey) {
    return;
  }

  bots[botNumber]
    .connectToRoom(roomSlug, roomPassword)
    .then(() => {
      message.reply(`Bot-${botNumber} is connected to ${roomSlug}`);
    })
    .catch(() => {
      message.reply("Cannot connect");
    });
};
