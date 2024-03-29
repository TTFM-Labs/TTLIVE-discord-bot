import { Message } from "discord.js";
import { checkBotKey } from "../utils/checkBotKey";

import { IBots } from "../utils/createBots";

export const onPlayPlaylistHandler = (
  bots: IBots,
  message: Message,
  args: string[] | undefined
): void => {
  if (!args || args.length < 2) {
    message.reply("Invalid command");

    return;
  }
  message.reply("Fetching playlist...");

  const [botNumber, playlistId] = args;

  const isValidKey = checkBotKey(botNumber, bots, message);

  if (!isValidKey) {
    return;
  }

  bots[botNumber]
    .playPlaylist(playlistId)
    .then(() => {
      message.reply(`Playing playlist ${playlistId}`);
    })
    .catch((e) => {
      message.reply(e.message);
    });
};
