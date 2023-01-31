import { BotMode, DjSeat, IInitialStateReceived, Song } from "./types";

export class BotState {
  public songs: Song[] = [];
  public playingUserUuids: (string | null)[] | [] = [];
  public roomSlug: string | undefined;
  public botMode: BotMode = "testing";

  public setSongs(songs: Song[]): void {
    this.songs = songs;
  }

  public getRandomSong(): Song | undefined {
    const song = this.songs[Math.floor(Math.random() * this.songs.length)];

    return song;
  }

  public setInitialState(msg: IInitialStateReceived): void {
    this.playingUserUuids = msg.djs.map(({ userUuid }) => userUuid);
  }

  public setPlayingUserUuids(djs: DjSeat[]): void {
    this.playingUserUuids = djs.map(({ userUuid }) => userUuid);
  }

  public checkIfShouldStayOnStage(botUuid: string): boolean {
    const playingDjs = this.playingUserUuids.filter((item) => item !== botUuid);

    return playingDjs.length === 0;
  }

  public isBotDj(botUuid: string): boolean {
    const bot = this.playingUserUuids.find((item) => item === botUuid);

    return !!bot;
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
