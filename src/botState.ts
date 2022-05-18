import { BotMode, IInitialStateReceived, Song } from "./types";

export class BotState {
  public songs: Song[] = [];
  public playingUserUuids: (string | null)[] | [] = [];
  public djSeatNumber: number | null = null;
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
    this.playingUserUuids = msg.djSeats.value
      .map((item) => item[1].userUuid)
      .filter((a) => a);
  }

  public addNewPlayingDj(userUuid: string): void {
    this.playingUserUuids = [...this.playingUserUuids, userUuid];
  }

  public removePlayingDj(userUuid: string): void {
    this.playingUserUuids = this.playingUserUuids.filter(
      (item) => item !== userUuid
    );
  }

  public checkIfShouldStayOnStage(botUuid: string): boolean {
    const playingDjs = this.playingUserUuids.filter((item) => item !== botUuid);

    return playingDjs.length === 0;
  }

  public isBotDj(botUuid: string): boolean {
    const bot = this.playingUserUuids.find((item) => item === botUuid);

    return !!bot;
  }

  public setDjSeatNumber(seat: string | null): void {
    if (seat === null) {
      this.djSeatNumber = null;
    } else {
      this.djSeatNumber = Number(seat);
    }
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
