import { Socket } from "socket.io-client";
import { BotStateTestsWrapper } from "./helpers/BotStateTestsWrapper";

import {
  initialStateReceivedMock,
  userUuid_1,
  userUuid_2,
} from "./mocks/initialStateMock";
import { songMock_1, songMock_2 } from "./mocks/songMock";

describe("Bot state tests", () => {
  let botState: BotStateTestsWrapper;

  beforeEach(() => {
    botState = new BotStateTestsWrapper();
  });

  it("shoud set songs", () => {
    expect(botState.songs).toEqual([]);

    botState.setSongs([songMock_1]);

    expect(botState.songs[0]).toEqual(songMock_1);
  });

  it("shoud return random song", () => {
    botState.setSongs([songMock_1, songMock_2]);

    const song = botState.getRandomSong();

    expect(song).toMatchInlineSnapshot(
      {
        artistName: expect.any(String),
        duration: expect.any(Number),
        genre: expect.any(String),
        id: expect.any(String),
        isrc: expect.any(String),
        musicProvider: expect.any(String),
        trackName: expect.any(String),
        trackUrl: expect.any(String),
      },
      `
Object {
  "artistName": Any<String>,
  "duration": Any<Number>,
  "genre": Any<String>,
  "id": Any<String>,
  "isrc": Any<String>,
  "musicProvider": Any<String>,
  "trackName": Any<String>,
  "trackUrl": Any<String>,
}
`
    );
  });

  it("shoud set playing djs uuids from init state", () => {
    botState.setInitialState(initialStateReceivedMock);

    expect(botState.playingUserUuids).toHaveLength(2);
    expect(botState.playingUserUuids).toContain(userUuid_1);
    expect(botState.playingUserUuids).toContain(userUuid_2);
  });

  it("shoud add user uuid", () => {
    const newUserUuid = "third-user-uuid";
    botState.setInitialState(initialStateReceivedMock);

    expect(botState.playingUserUuids).toHaveLength(2);

    botState.addNewPlayingDj(newUserUuid);

    expect(botState.playingUserUuids).toHaveLength(3);
    expect(botState.playingUserUuids).toContain(userUuid_1);
    expect(botState.playingUserUuids).toContain(userUuid_2);
    expect(botState.playingUserUuids).toContain(newUserUuid);
  });

  it("shoud remove user-1 uuid", () => {
    botState.setInitialState(initialStateReceivedMock);
    expect(botState.playingUserUuids).toHaveLength(2);

    botState.removePlayingDj(userUuid_1);

    expect(botState.playingUserUuids).toHaveLength(1);
    expect(botState.playingUserUuids).toContain(userUuid_2);
  });

  it("checkIfShouldStayOnStage should return false", () => {
    const botUuid = userUuid_1;
    botState.setInitialState(initialStateReceivedMock);
    expect(botState.playingUserUuids).toHaveLength(2);

    const shouldStayOnStage = botState.checkIfShouldStayOnStage(botUuid);

    expect(shouldStayOnStage).toBeFalsy();
  });

  it("checkIfShouldStayOnStage should return true", () => {
    const botUuid = userUuid_1;
    botState.setState({
      roomSlug: "test-slug",
      songs: [],
      playingUserUuids: [botUuid],
      djSeatNumber: 0,
      botMode: "bot",
    });

    expect(botState.playingUserUuids).toHaveLength(1);

    const shouldStayOnStage = botState.checkIfShouldStayOnStage(botUuid);

    expect(shouldStayOnStage).toBeTruthy();
  });

  it("should set DjSeatNumber", () => {
    const seatNumberStr = "1";
    botState.setDjSeatNumber(seatNumberStr);

    expect(botState.djSeatNumber).toBe(Number(seatNumberStr));
  });

  it("should set roomSlug", () => {
    const roomSlug = "test-room-slug";
    botState.setRoomSlug(roomSlug);

    expect(botState.roomSlug).toBe(roomSlug);
  });

  it("should return TRUE if bot is dj", () => {
    const botUuid = userUuid_1;
    botState.setState({
      roomSlug: "test-slug",
      songs: [],
      playingUserUuids: [botUuid],
      djSeatNumber: 0,
      botMode: "bot",
    });

    expect(botState.playingUserUuids).toHaveLength(1);
    const isDj = botState.isBotDj(botUuid);

    expect(isDj).toBeTruthy();
  });

  it("should return FALSE if bot is not dj", () => {
    const botUuid = userUuid_1;
    botState.setState({
      roomSlug: "test-slug",
      songs: [],
      playingUserUuids: [userUuid_2],
      djSeatNumber: 0,
      botMode: "bot",
    });

    expect(botState.playingUserUuids).toHaveLength(1);
    const isDj = botState.isBotDj(botUuid);

    expect(isDj).toBeFalsy();
  });
});
