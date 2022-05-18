import { Message } from "discord.js";

import { IBots } from "../utils/createBots";

export const onStatusHandler = (bots: IBots, message: Message): void => {
  let statusMessage = "*\n";

  for (const [botId, bot] of Object.entries(bots)) {
    if (bot.botState.roomSlug) {
      statusMessage = `${statusMessage} Bot-${botId} connected to ${bot.botState.roomSlug}\n`;
    } else {
      statusMessage = `${statusMessage} Bot-${botId} disconnected\n`;
    }
  }

  message.reply(statusMessage);
};
