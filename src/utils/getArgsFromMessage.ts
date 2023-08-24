import { Message } from "discord.js";

import { COMMAND_PREFIX } from "../const";
import { BotMessages } from "../types";

interface IGetArgs {
  command: BotMessages | undefined;
  args: string[] | undefined;
}

export const getArgsFromMessage = (message: Message): IGetArgs => {
  if (!message.content.startsWith(COMMAND_PREFIX) || message.author.bot) {
    return {
      command: undefined,
      args: undefined,
    };
  }

  const args = message.content.slice(COMMAND_PREFIX.length).trim().split(" ");
  const command = args.shift()?.toLocaleLowerCase() as BotMessages;

  return {
    command,
    args: args.length === 0 ? undefined : args,
  };
};
