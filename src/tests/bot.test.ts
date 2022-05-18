import { Bot, Io } from "../bot";
import fetch from "node-fetch";
import EventEmitter from "events";
import { Socket } from "socket.io-client";

import { mockedSpotifyResponse } from "./mocks/mockedSpotifyResponse";
import { SocketMessages } from "../types";
import { songMock_1 } from "./mocks/songMock";
import { initialStateReceivedMock, userUuid_1 } from "./mocks/initialStateMock";
import { BotStateTestsWrapper } from "./helpers/BotStateTestsWrapper";
import { roomsServiceApiBaseUrl } from "../const";

jest.mock("node-fetch", () => jest.fn());

const socketMock = {
  emit: jest.fn(),
  on: jest.fn(),
  io: {
    reconnection: jest.fn(),
  },
  close: jest.fn(),
};
const io = jest.fn(() => socketMock) as any as Io;

describe("Bot tests", () => {
  let bot: Bot;
  let botState: BotStateTestsWrapper;
  let eventEmitter: EventEmitter;

  const accessToken = "test-accessToken";
  const spotifyRefreshToken = "test-spotifyRefreshToken";
  const spotifyCredentials = "test-spotifyCredentials";
  const avatarId = "test-avatar-id";
  const botUuid = "test-bot-uuid";
  const roomSlug = "my-test-room";
  const testSocketPath = "test-socket-path";
  const testDomain = "test-socket-domain";
  const djSeatNumber = "1";

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    botState = new BotStateTestsWrapper();

    bot = Bot.createBot(
      io,
      accessToken,
      spotifyRefreshToken,
      spotifyCredentials,
      avatarId,
      botUuid,
      botState
    );

    eventEmitter = new EventEmitter();

    socketMock.emit.mockClear();
    socketMock.on.mockClear();
    fetch.mockClear();
  });

  test("should fetch roomConfig and connect to the room", async () => {
    socketMock.on.mockImplementation((event, cb) => {
      if (event === "connect") {
        cb();
      }
    });

    fetch.mockImplementation(() =>
      Promise.resolve({
        json: () => {
          return {
            socketDomain: testDomain,
            socketPath: testSocketPath,
          };
        },
      })
    );

    await bot.connectToRoom(roomSlug, null);

    expect(fetch).toBeCalledWith(
      `${roomsServiceApiBaseUrl}/rooms/${roomSlug}/join`,
      {
        headers: { authorization: `Bearer ${accessToken}` },
        method: "POST",
      }
    );

    expect(io).toBeCalledWith(`https://${testDomain}`, {
      path: testSocketPath,
      transportOptions: {
        polling: {
          extraHeaders: {
            "X-TT-password": null,
            authorization: `Bearer ${accessToken}`,
          },
        },
      },
      reconnection: true,
      reconnectionAttempts: 7,
      reconnectionDelay: 5000,
    });

    expect(botState.getState().roomSlug).toBe(roomSlug);
  });

  test("should fetch playlist and emit playNextSong message", async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        json: () => mockedSpotifyResponse,
      })
    );

    bot.setSocket(socketMock as unknown as Socket);

    botState.setState({
      roomSlug,
      songs: [],
      playingUserUuids: [],
      djSeatNumber: null,
      botMode: "bot",
    });

    await bot.playPlaylist("playlist-id", djSeatNumber);

    expect(socketMock.emit).toBeCalledTimes(1);
    expect(socketMock.emit).toHaveBeenNthCalledWith(
      1,
      SocketMessages.takeDjSeat,
      {
        avatarId,
        djSeatKey: 1,
        nextTrack: {
          song: {
            artistName: "artist-name-1",
            duration: 0,
            genre: "",
            id: "spotify:track:test-id-1",
            isrc: "test-isrc-1",
            musicProvider: "spotify",
            trackName: "test-name-1",
            trackUrl: "",
          },
        },
      }
    );

    expect(botState.getState().djSeatNumber).toBe(Number(djSeatNumber));
    expect(botState.getState().songs).toHaveLength(2);
    expect(botState.getState().songs).toMatchInlineSnapshot(`
    Array [
      Object {
        "artistName": "artist-name-1",
        "duration": 0,
        "genre": "",
        "id": "spotify:track:test-id-1",
        "isrc": "test-isrc-1",
        "musicProvider": "spotify",
        "trackName": "test-name-1",
        "trackUrl": "",
      },
      Object {
        "artistName": "artist-name-2",
        "duration": 0,
        "genre": "",
        "id": "spotify:track:test-id-2",
        "isrc": "test-isrc-2",
        "musicProvider": "spotify",
        "trackName": "test-name-2",
        "trackUrl": "",
      },
    ]
    `);
  });

  test("should set DjSeat to null and emit leaveDjSeat msg", async () => {
    bot.setSocket(socketMock as unknown as Socket);
    botState.setState({
      roomSlug,
      songs: [],
      playingUserUuids: [botUuid],
      djSeatNumber: 3,
      botMode: "bot",
    });

    await bot.leaveDjSeat();

    expect(socketMock.emit).toBeCalledWith(SocketMessages.leaveDjSeat, {
      userUuid: botUuid,
    });

    expect(botState.getState().djSeatNumber).toBeNull();
  });

  test("should emit sendNextTrackToPlay message", async () => {
    bot.setSocket(socketMock as unknown as Socket);
    botState.setState({
      roomSlug,
      songs: [songMock_1],
      playingUserUuids: [botUuid],
      djSeatNumber: 3,
      botMode: "bot",
    });
    bot.configureListeners(eventEmitter as unknown as Socket);

    eventEmitter.emit(SocketMessages.playNextSong);

    expect(socketMock.emit).toHaveBeenNthCalledWith(
      1,
      SocketMessages.sendNextTrackToPlay,
      {
        song: songMock_1,
        trackUrl: "",
      }
    );
  });

  test("should set initial state", async () => {
    bot.setSocket(socketMock as unknown as Socket);
    botState.setState({
      roomSlug,
      songs: [],
      playingUserUuids: [],
      djSeatNumber: null,
      botMode: "bot",
    });
    bot.configureListeners(eventEmitter as unknown as Socket);

    eventEmitter.emit(
      SocketMessages.sendInitialState,
      initialStateReceivedMock
    );

    const playingUserUuids = botState.getState().playingUserUuids;
    expect(playingUserUuids).toHaveLength(2);
    expect(playingUserUuids).toContain(
      initialStateReceivedMock.djSeats.value[0][1].userUuid
    );
    expect(playingUserUuids).toContain(
      initialStateReceivedMock.djSeats.value[1][1].userUuid
    );
  });

  test("bot should leave the stage when someone starts playing", async () => {
    bot.setSocket(socketMock as unknown as Socket);
    botState.setState({
      roomSlug,
      songs: [songMock_1],
      playingUserUuids: [botUuid],
      djSeatNumber: 1,
      botMode: "bot",
    });
    bot.configureListeners(eventEmitter as unknown as Socket);

    eventEmitter.emit(SocketMessages.takeDjSeat, { userUuid: userUuid_1 });

    const state = botState.getState();
    expect(state.playingUserUuids).toHaveLength(2);
    expect(state.playingUserUuids).toContain(
      initialStateReceivedMock.djSeats.value[0][1].userUuid
    );
    expect(state.djSeatNumber).toBe(1);
    expect(state.songs).toHaveLength(1);

    expect(socketMock.emit).toHaveBeenNthCalledWith(
      1,
      SocketMessages.leaveDjSeat,
      {
        userUuid: botUuid,
      }
    );
  });

  test("bot should start playing when the stage is empty", async () => {
    bot.setSocket(socketMock as unknown as Socket);
    botState.setState({
      roomSlug,
      songs: [songMock_1],
      playingUserUuids: [userUuid_1],
      djSeatNumber: 1,
      botMode: "bot",
    });
    bot.configureListeners(eventEmitter as unknown as Socket);

    eventEmitter.emit(SocketMessages.leaveDjSeat, { userUuid: userUuid_1 });

    const state = botState.getState();
    expect(state.playingUserUuids).toHaveLength(0);

    expect(socketMock.emit).toHaveBeenNthCalledWith(
      1,
      SocketMessages.takeDjSeat,
      {
        avatarId,
        djSeatKey: 1,
        nextTrack: { song: songMock_1 },
      }
    );
  });

  test("bot in testing mode shouldn't leave the stage when someone starts playing", async () => {
    bot.setSocket(socketMock as unknown as Socket);
    botState.setState({
      roomSlug,
      songs: [songMock_1],
      playingUserUuids: [],
      djSeatNumber: 1,
      botMode: "testing",
    });
    bot.configureListeners(eventEmitter as unknown as Socket);

    eventEmitter.emit(SocketMessages.takeDjSeat, { userUuid: userUuid_1 });

    const state = botState.getState();
    expect(state.playingUserUuids).toHaveLength(1);
    expect(state.playingUserUuids).toContain(
      initialStateReceivedMock.djSeats.value[0][1].userUuid
    );
    expect(state.djSeatNumber).toBe(1);
    expect(state.songs).toHaveLength(1);

    expect(socketMock.emit).not.toHaveBeenCalled();
  });

  test("bot in testing mode shouldn't start playing when the stage is empty", async () => {
    bot.setSocket(socketMock as unknown as Socket);
    botState.setState({
      roomSlug,
      songs: [songMock_1],
      playingUserUuids: [userUuid_1],
      djSeatNumber: 1,
      botMode: "testing",
    });
    bot.configureListeners(eventEmitter as unknown as Socket);

    eventEmitter.emit(SocketMessages.leaveDjSeat, { userUuid: userUuid_1 });

    const state = botState.getState();
    expect(state.playingUserUuids).toHaveLength(0);

    expect(socketMock.emit).not.toHaveBeenCalled();
  });

  test("should take dj seat, nextTrack shoud be null", async () => {
    const djSeatToTake = "1";

    bot.setSocket(socketMock as unknown as Socket);
    botState.setState({
      roomSlug,
      songs: [],
      playingUserUuids: [],
      djSeatNumber: null,
      botMode: "bot",
    });

    bot.takeDjSeat(djSeatToTake);

    expect(socketMock.emit).toBeCalledWith(SocketMessages.takeDjSeat, {
      avatarId,
      djSeatKey: Number(djSeatToTake),
      nextTrack: null,
    });

    expect(botState.getState().djSeatNumber).toBe(Number(djSeatToTake));
  });

  test("should take dj seat, song shouldn't be a null", async () => {
    const djSeatToTake = "1";

    bot.setSocket(socketMock as unknown as Socket);
    botState.setState({
      roomSlug,
      songs: [songMock_1],
      playingUserUuids: [],
      djSeatNumber: null,
      botMode: "bot",
    });

    bot.takeDjSeat(djSeatToTake);

    expect(socketMock.emit).toBeCalledWith(SocketMessages.takeDjSeat, {
      avatarId,
      djSeatKey: Number(djSeatToTake),
      nextTrack: {
        song: songMock_1,
      },
    });
  });
});
