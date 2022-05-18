import { SocketAddress } from "net";
import { Socket, io } from "socket.io-client";
import { BotState } from "./botState";

import {
  IInitialStateReceived,
  ILeaveDjSeat,
  ISpotifyPlaylist,
  ITakeDjSeat,
  SocketMessages,
  Song,
} from "./types";
import { fetchSpotifyPlaylist } from "./utils/fetchSpotifyPlaylist";
import { getRoomConfigForClient } from "./utils/getRoomConfigForClient";

export type Io = typeof io;

export class Bot {
  private readonly io: Io;
  public accessToken: string;
  private spotifyRefreshToken: string;
  private spotifyCredentials: string;
  private avatarId: string;
  private botUuid: string;
  private socket: Socket | undefined;

  public botState: BotState;

  private constructor(
    io: Io,
    accessToken: string,
    spotifyRefreshToken: string,
    spotifyCredentials: string,
    avatarId: string,
    botUuid: string,
    botState: BotState
  ) {
    this.io = io;
    this.accessToken = accessToken;
    this.spotifyRefreshToken = spotifyRefreshToken;
    this.spotifyCredentials = spotifyCredentials;
    this.avatarId = avatarId;
    this.botUuid = botUuid;
    this.botState = botState;
  }

  public static createBot(
    io: Io,
    accessToken: string,
    spotifyRefreshToken: string,
    spotifyCredentials: string,
    avatarId: string,
    botUuid: string,
    botState: BotState
  ): Bot {
    const _bot = new Bot(
      io,
      accessToken,
      spotifyRefreshToken,
      spotifyCredentials,
      avatarId,
      botUuid,
      botState
    );

    return _bot;
  }

  private async delay(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private setPlayNextSongListener(socket: Socket): void {
    socket.on(SocketMessages.playNextSong, () => {
      this.sendNextTrackToPlay();
    });
  }

  private setSendInitialStateListener(socket: Socket): void {
    socket.on(
      SocketMessages.sendInitialState,
      (state: IInitialStateReceived) => {
        this.botState.setInitialState(state);

        this.takeOrLeaveDjSeat();
      }
    );
  }

  private setTakeDjSeatListener(socket: Socket): void {
    socket.on(SocketMessages.takeDjSeat, (msg: ITakeDjSeat) => {
      this.botState.addNewPlayingDj(msg.userUuid);

      this.takeOrLeaveDjSeat();
    });
  }

  private setLeaveDjSeatListener(socket: Socket): void {
    socket.on(SocketMessages.leaveDjSeat, (msg: ILeaveDjSeat) => {
      this.botState.removePlayingDj(msg.userUuid);

      this.takeOrLeaveDjSeat();
    });
  }

  private takeOrLeaveDjSeat(): void {
    if (this.botState.getBotMode() === "testing") {
      return;
    }

    const shouldStayOnStage = this.botState.checkIfShouldStayOnStage(
      this.botUuid
    );

    if (shouldStayOnStage) {
      this.takeDjSeat();
    } else {
      this.emitLeaveDjSeatMsg();
    }
  }

  configureListeners(socket: Socket): void {
    this.setPlayNextSongListener(socket);
    this.setSendInitialStateListener(socket);
    this.setTakeDjSeatListener(socket);
    this.setLeaveDjSeatListener(socket);
  }

  setSocket(socket: Socket | undefined): void {
    this.socket = socket;
  }

  public async connect(
    socketDomain: string,
    socketPath: string,
    password: string | null
  ): Promise<{ connected: boolean }> {
    const socket = this.io(`https://${socketDomain}`, {
      path: socketPath,
      transportOptions: {
        polling: {
          extraHeaders: {
            "X-TT-password": password,
            authorization: `Bearer ${this.accessToken}`,
          },
        },
      },
      reconnectionAttempts: 7,
      reconnectionDelay: 5000,
      reconnection: true,
    });

    this.configureListeners(socket);

    return new Promise((resolve, reject) => {
      socket.on("connect", () => {
        console.info("Connected in client");
        this.setSocket(socket);
        resolve({ connected: true });
      });

      socket.on("connect_error", (error: Error) => {
        console.log({ msg: "Error in Bot.connect", error });
        reject(error.message);
      });
    });
  }

  private async close(): Promise<boolean> {
    return new Promise((resolveClose, _reject) => {
      this.socket?.on("disconnect", () => {
        this.setSocket(undefined);
        console.log("Connection closed sucefully");

        resolveClose(true);
      });

      this.socket?.on("error", (error: Error) => {
        this.setSocket(undefined);
        console.log({ msg: "Connection closed failed", error });

        resolveClose(true);
      });

      if (!this.socket) {
        resolveClose(true);
      }

      this?.socket?.io.reconnection(false);
      this?.socket?.close();
    });
  }

  private async sendNextTrackToPlay(): Promise<void> {
    const song = this.botState.getRandomSong();
    if (process.env.NODE_ENV !== "test") {
      await this.delay(500);
    }

    if (!song || !this.botState.isBotDj(this.botUuid)) {
      return;
    }

    const nextTrack = {
      song,
      trackUrl: "",
    };

    this.socket?.emit(SocketMessages.sendNextTrackToPlay, nextTrack);
  }

  private getSongsFromPlaylist(playlist: ISpotifyPlaylist): Song[] {
    const songs = playlist.tracks.items.map((item) => {
      const song: Song = {
        artistName: item.track.artists[0].name,
        duration: Math.floor(item.track.duration_ms / 1000),
        genre: "",
        id: "spotify:track:" + item.track.id,
        isrc: item.track.external_ids.isrc,
        musicProvider: "spotify",
        trackName: item.track.name,
        trackUrl: "",
      };

      return song;
    });

    return songs;
  }

  public async connectToRoom(
    roomSlug: string,
    roomPassword: string | null
  ): Promise<void> {
    await this.disconnectFromRoom();
    const roomConfig = await getRoomConfigForClient(roomSlug, this.accessToken);

    if (!roomConfig) {
      return;
    }

    await this.connect(
      roomConfig.socketDomain,
      roomConfig.socketPath,
      roomPassword
    );

    this.botState.setRoomSlug(roomSlug);
  }

  public async disconnectFromRoom(): Promise<boolean> {
    this.leaveDjSeat();
    if (process.env.NODE_ENV !== "test") {
      await this.delay(1000);
    }

    const isClosed = await this.close();
    this.botState.setRoomSlug(undefined);

    return isClosed;
  }

  public async playPlaylist(
    playlistId: string,
    djSeatNumber: string
  ): Promise<void> {
    if (this.botState.roomSlug === undefined) {
      throw new Error("Please connect to the room first");
    }

    this.leaveDjSeat();

    const playlist = await fetchSpotifyPlaylist(
      playlistId,
      this.spotifyRefreshToken,
      this.spotifyCredentials
    );

    if (!playlist) {
      return;
    }

    const songs = this.getSongsFromPlaylist(playlist);
    this.botState.setSongs(songs);

    this.botState.setDjSeatNumber(djSeatNumber);

    if (this.botState.getBotMode() === "testing") {
      this.takeDjSeat();
    } else {
      this.takeOrLeaveDjSeat();
    }

    this.sendNextTrackToPlay();
  }

  public async leaveDjSeat(): Promise<void> {
    this.botState.setDjSeatNumber(null);
    this.emitLeaveDjSeatMsg();
  }

  private emitLeaveDjSeatMsg(): void {
    if (this.botState.isBotDj(this.botUuid)) {
      this.socket?.emit(SocketMessages.leaveDjSeat, {
        userUuid: this.botUuid,
      });
    }
  }

  public takeDjSeat(djSeatStr?: string): void {
    if (djSeatStr) {
      this.botState.setDjSeatNumber(djSeatStr);
    }

    const nextTrack =
      this.botState.songs.length === 0
        ? null
        : {
            song: this.botState.songs[0],
          };

    this.emitTakeDjSeatMsg(nextTrack);
  }

  private emitTakeDjSeatMsg(nextTrack: null | { song: Song }): void {
    if (
      !this.botState.checkIfShouldStayOnStage(this.botUuid) ||
      this.botState.isBotDj(this.botUuid) ||
      this.botState.djSeatNumber === null
    ) {
      return;
    }

    this.socket?.emit(SocketMessages.takeDjSeat, {
      avatarId: this.avatarId,
      djSeatKey: this.botState.djSeatNumber,
      nextTrack,
    });
  }
}
