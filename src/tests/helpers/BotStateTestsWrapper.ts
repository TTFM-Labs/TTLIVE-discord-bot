import { BotState } from "../../botState";
import { BotMode, Song } from "../../types";

export interface IBotTestState {
  songs: Song[] | [];
  playingUserUuids: (string | null)[];
  roomSlug: string | undefined;
  botMode: BotMode;
}
export class BotStateTestsWrapper extends BotState {
  public setState(state: IBotTestState) {
    this.songs = state.songs;
    this.playingUserUuids = state.playingUserUuids;
    this.roomSlug = state.roomSlug;
    this.botMode = state.botMode;
  }

  public getState(): IBotTestState {
    return {
      songs: this.songs,
      playingUserUuids: this.playingUserUuids,
      roomSlug: this.roomSlug,
      botMode: this.botMode,
    };
  }
}
