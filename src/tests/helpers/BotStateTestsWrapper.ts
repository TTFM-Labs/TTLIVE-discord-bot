import { BotState } from "../../botState";
import { BotMode, Song } from "../../types";

export interface IBotTestState {
  songs: Song[] | [];
  playingUserUuids: (string | null)[];
  djSeatNumber: number | null;
  roomSlug: string | undefined;
  botMode: BotMode;
}
export class BotStateTestsWrapper extends BotState {
  public setState(state: IBotTestState) {
    this.songs = state.songs;
    this.playingUserUuids = state.playingUserUuids;
    this.djSeatNumber = state.djSeatNumber;
    this.roomSlug = state.roomSlug;
    this.botMode = state.botMode;
  }

  public getState(): IBotTestState {
    return {
      songs: this.songs,
      playingUserUuids: this.playingUserUuids,
      djSeatNumber: this.djSeatNumber,
      roomSlug: this.roomSlug,
      botMode: this.botMode,
    };
  }
}
