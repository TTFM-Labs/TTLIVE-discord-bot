import { io } from "socket.io-client";

import { Bot } from "../bot";
import { BotState } from "../botState";
import { getUserProfile } from "./getUserProfile";
import { logIn } from "./login";
import { config } from "../../config";

export interface IBots {
  [key: string]: Bot;
}

export const createBots = async (botInstancesCount: number): Promise<IBots> => {
  const { email, password, spotify_credentials, spotify_refresh_token } =
    config;
  const bots: IBots = {};
  const { accessToken } = await logIn({
    email,
    password,
  });

  for (let i = 1; i <= botInstancesCount; i++) {
    const profile = await getUserProfile(accessToken);

    const bot = Bot.createBot(
      io,
      accessToken,
      spotify_refresh_token,
      spotify_credentials,
      profile.avatarId,
      profile.uuid,
      new BotState()
    );
    bots[i] = bot;
  }

  return bots;
};
