import { Client } from "discord.js";
import fetch from "node-fetch";
import { EventEmitter } from "events";
import { Socket } from "socket.io-client";
import waitForExpect from "wait-for-expect";

import { Bot, Io } from "../bot";
import { IBots } from "../utils/createBots";
import { BotStateTestsWrapper } from "./helpers/BotStateTestsWrapper";
import { setDiscordMessagesListener } from "../utils/setDiscordMessagesListener";
import { roomsServiceApiBaseUrl } from "../const";

jest.mock("node-fetch", () => jest.fn());
const socketMock = {
  emit: jest.fn(),
  on: jest.fn(),
  io: {
    reconnection: jest.fn(),
  },
  close: jest.fn(() => Promise.resolve(true)),
};

const ioMock = jest.fn(() => socketMock);
const io = ioMock as any as Io;
const reply = jest.fn();

describe("Discord input message tests", () => {
  let bots: IBots = {};
  let discordClient;

  beforeEach(() => {
    for (let i = 1; i <= 3; i++) {
      const botState = new BotStateTestsWrapper();

      const bot = Bot.createBot(
        io,
        `accessToken-${i}`,
        `spotifyCredentials-${i}`,
        `avatarId-${i}`,
        `botUuid-${i}`,
        botState
      );

      bot.setSocket(socketMock as any as Socket);

      bots[i] = bot;
    }

    socketMock.emit.mockClear();
    socketMock.on.mockClear();
    socketMock.io.reconnection.mockClear();
    socketMock.close.mockClear();
    reply.mockClear();
    fetch.mockClear();
    ioMock.mockClear();

    discordClient = new EventEmitter();

    setDiscordMessagesListener(discordClient as Client, bots);
  });

  it("should reply with message that contains status of the bots", async () => {
    const discordMessage = {
      content: "!status",
      author: { bot: null },
      reply,
    };

    discordClient.emit("messageCreate", discordMessage);

    expect(reply).toBeCalledTimes(1);

    expect(reply.mock.calls[0][0]).toContain("Bot-1 disconnected");
    expect(reply.mock.calls[0][0]).toContain("Bot-2 disconnected");
    expect(reply.mock.calls[0][0]).toContain("Bot-3 disconnected");
    expect(reply.mock.calls[0][0]).not.toContain("Bot-4 disconnected");
  });

  it("should emit takeDjSeat msg if input is valid", () => {
    const botNum = "1";

    const discordMessage = {
      content: `!takedj ${botNum}`,
      author: { bot: null },
      reply,
    };

    discordClient.emit("messageCreate", discordMessage);

    expect(reply).toBeCalledTimes(1);

    expect(socketMock.emit).toBeCalledWith("takeDjSeat", {
      avatarId: `avatarId-${botNum}`,
      nextTrack: null,
    });
  });

  it("Bot 1 should connect to the room with slug <test-room>", async () => {
    const botNum = "1";
    const roomSlug = "test-room";
    const socketDomain = "test-domain";
    const socketPath = "test-path";

    const discordMessage = {
      content: `!connect ${botNum} ${roomSlug}`,
      author: {
        bot: false,
      },
      reply,
    };

    fetch.mockImplementation(() =>
      Promise.resolve({
        json: () => {
          return {
            socketDomain,
            socketPath,
          };
        },
      })
    );

    socketMock.on.mockImplementation((event, cb) => {
      if (event === "connect" || event === "disconnect") {
        cb();
      }
    });

    discordClient.emit("messageCreate", discordMessage);

    expect(reply).toBeCalledTimes(1);

    await waitForExpect(() => {
      expect(fetch).toBeCalledWith(
        `${roomsServiceApiBaseUrl}/rooms/${roomSlug}/join`,
        {
          headers: { authorization: `Bearer accessToken-1` },
          method: "POST",
        }
      );
    });

    await waitForExpect(() => {
      expect(io).toBeCalledWith(`https://${socketDomain}`, {
        path: socketPath,
        transportOptions: {
          polling: {
            extraHeaders: {
              "X-TT-password": null,
              authorization: `Bearer accessToken-1`,
            },
          },
        },
        reconnection: true,
        reconnectionAttempts: 7,
        reconnectionDelay: 5000,
      });
    });
  });

  it("shouldn't connnect if input is invalid", async () => {
    const discordMessage = {
      content: "!connect 10 test-room",
      author: { bot: null },
      reply,
    };

    discordClient.emit("messageCreate", discordMessage);

    expect(reply).toBeCalledTimes(2);
    expect(reply).toHaveBeenNthCalledWith(1, "Bot is connecting...");
    expect(reply).toHaveBeenNthCalledWith(2, "Bot 10 doesn't exists");
    console.log(reply.mock.calls);
  });
});
