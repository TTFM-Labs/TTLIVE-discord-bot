import { Client, Message } from "discord.js";

import { BotMessages } from "../types";
import { IBots } from "./createBots";
import { getArgsFromMessage } from "./getArgsFromMessage";
import { onChangeModeHandler } from "../commandsHandlers/onChangeModeHandler";
import { onConnectHandler } from "../commandsHandlers/onConnectHandler";
import { onDisconnectHandler } from "../commandsHandlers/onDisconnectHandler";
import { onLeaveDjSeatHandler } from "../commandsHandlers/onLeaveDjSeatHandler";
import { onPlayPlaylistHandler } from "../commandsHandlers/onPlayPlaylistHandler";
import { onStatusHandler } from "../commandsHandlers/onStatusHandler";
import { onTakeSeatHandler } from "../commandsHandlers/onTakeSeatHandler";

export const setDiscordMessagesListener = (
  client: Client,
  bots: IBots
): void => {
  client.on("messageCreate", (message: Message) => {
    const { command, args } = getArgsFromMessage(message);

    switch (command) {
      case BotMessages.STATUS:
        onStatusHandler(bots, message);
        break;
      case BotMessages.CONNECT:
        onConnectHandler(bots, message, args);
        break;
      case BotMessages.DISCONNECT:
        onDisconnectHandler(bots, message, args);
        break;
      case BotMessages.PLAY_PLAYLIST:
        onPlayPlaylistHandler(bots, message, args);
        break;
      case BotMessages.LEAVE_DJ_SEAT:
        onLeaveDjSeatHandler(bots, message, args);
        break;
      case BotMessages.CHANGE_MODE:
        onChangeModeHandler(bots, message, args);
        break;
      case BotMessages.TAKE_DJ_SEAT:
        onTakeSeatHandler(bots, message, args);
        break;
      default:
        return;
    }
  });
};
