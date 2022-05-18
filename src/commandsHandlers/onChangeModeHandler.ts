import { Message } from "discord.js";

import { IBots } from "../utils/createBots";

export const onChangeModeHandler = (
  bots: IBots,
  message: Message,
  args: string[] | undefined
): void => {
  if (!args || args.length < 1) {
    message.reply("Invalid command");

    return;
  }

  const [mode] = args;

  if (mode !== "testing" && mode !== "bot") {
    message.reply("Incorrect mode. Please select <bot> or <testing> mode");

    return;
  }

  for (const [_, bot] of Object.entries(bots)) {
    bot.botState.setBotMode(mode);
  }

  message.reply(`Bots are in ${mode} mode`);
};
