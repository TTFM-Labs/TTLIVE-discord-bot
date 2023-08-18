import { RoomState } from "@ttfm-labs/socket";
import { BotMode } from "./types";
import { MinimalCrateSongResDTO } from "@ttfm-labs/socket/dist-client/types/services";

export class BotState {
  public roomState: RoomState | undefined;
  public songs: MinimalCrateSongResDTO[] = [];
  public roomSlug: string | undefined;
  public botMode: BotMode = "bot";
  public songIndex = 0;

  public setSongs(songs: MinimalCrateSongResDTO[]): void {
    this.songs = songs;
  }

  public getRandomSong(): MinimalCrateSongResDTO | undefined {
    const song = this.songs[Math.floor(Math.random() * this.songs.length)];

    return song;
  }

  public checkIfShouldStayOnStage(botUuid: string): boolean {
    if (!this.songs.length) {
      return false;
    }
    const playingDjs =
      this.roomState?.djs.filter((dj) => dj.userProfile.uuid !== botUuid)
        .length ?? 0;

    return playingDjs === 0 || this.botMode === "testing";
  }

  public isBotDj(botUuid: string): boolean {
    const bot = this.roomState?.djs.some(
      (dj) => dj.userProfile.uuid === botUuid
    );

    return !!bot;
  }

  public setRoomState(state: RoomState | undefined) {
    this.roomState = state;
  }

  public setRoomSlug(roomSlug: string | undefined): void {
    this.roomSlug = roomSlug;
  }

  public setBotMode(botMode: BotMode): void {
    this.botMode = botMode;
  }

  public getBotMode(): BotMode {
    return this.botMode;
  }
}
