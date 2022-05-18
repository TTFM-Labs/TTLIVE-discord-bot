import { Message } from "discord.js";

import { IBots } from "./createBots";

export const checkBotKey = (
  botNumberStr: string,
  bots: IBots,
  message: Message
): boolean => {
  for (const [botKey] of Object.entries(bots)) {
    if (botKey === botNumberStr) {
      return true;
    }
  }

  message.reply(`Bot ${botNumberStr} doesn't exists`);

  return false;
};
