import { Message } from "discord.js";
import { checkBotKey } from "../utils/checkBotKey";

import { IBots } from "../utils/createBots";

export const onTakeSeatHandler = (
  bots: IBots,
  message: Message,
  args: string[] | undefined
): void => {
  if (!args || args.length === 0) {
    message.reply("Invalid command");

    return;
  }

  const [botNumber] = args;

  const isValidKey = checkBotKey(botNumber, bots, message);

  if (!isValidKey) {
    return;
  }

  bots[botNumber].addDj();

  message.reply(`Bot ${botNumber} taking DJ Seat`);
};
