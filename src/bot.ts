import { BotState } from "./botState";
import { SOCKET_URL } from "./const";

import { ISpotifyTrack } from "./types";
import { fetchSpotifyPlaylistTracks } from "./utils/fetchSpotifyPlaylist";
import { getRoomConfigForClient } from "./utils/getRoomConfigForClient";
import {
  ActionName,
  AddDjAction,
  MinimalCrateSongResDTO,
  RemoveDjAction,
  ServerMessageName,
  SocketClient,
  UpdateNextSongAction,
} from "@ttfm-labs/socket";
import { applyPatch } from "fast-json-patch";

export class Bot {
  private socketClient: SocketClient | undefined;
  public accessToken: string;
  private spotifyCredentials: string;
  private botUuid: string;

  public botState: BotState;

  constructor(
    accessToken: string,
    spotifyCredentials: string,
    botUuid: string,
    botState = new BotState()
  ) {
    this.accessToken = accessToken;
    this.spotifyCredentials = spotifyCredentials;
    this.botUuid = botUuid;
    this.botState = botState;
  }

  private async delay(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private takeOrLeaveDjSeat(): void {
    if (this.botState.botMode === "testing") {
      return;
    }
    const shouldStayOnStage = this.botState.checkIfShouldStayOnStage(
      this.botUuid
    );

    if (shouldStayOnStage) {
      this.addDj();
    } else {
      this.removeDj();
    }
  }

  private async updateNextSong(): Promise<void> {
    const song = this.botState.getRandomSong();
    if (process.env.NODE_ENV !== "test") {
      await this.delay(500);
    }

    if (!song || !this.botState.isBotDj(this.botUuid)) {
      return;
    }

    this.socketClient?.action<UpdateNextSongAction>(ActionName.updateNextSong, {
      song,
    });
  }

  private convertTracksToCrateSongs(
    tracks: ISpotifyTrack[]
  ): MinimalCrateSongResDTO[] {
    const songs = tracks.map((item) => {
      const song: MinimalCrateSongResDTO = {
        artistName: item.track.artists[0].name,
        duration: Math.floor(item.track.duration_ms / 1000),
        genre: null,
        musicProviders: {
          spotify: "spotify:track:" + item.track.id,
        },
        isrc: item.track.external_ids.isrc,
        trackName: item.track.name,
        playbackToken: null,
        thumbnails: {},
      };

      return song;
    });

    return songs;
  }

  public setSocketClient(socketClient: SocketClient | undefined) {
    this.socketClient = socketClient;
  }

  public configureListener(socketClient: SocketClient) {
    socketClient.on("statefulMessage", (message) => {
      if (this.botState.roomState) {
        this.botState.setRoomState(
          applyPatch(this.botState.roomState, message.statePatch).newDocument
        );

        if (
          message.name === ServerMessageName.addedDj ||
          message.name === ServerMessageName.removedDj
        ) {
          this.takeOrLeaveDjSeat();
        }

        if (message.name === ServerMessageName.playedSong) {
          this.updateNextSong();
        }
      }
    });
  }

  public async connectToRoom(
    roomSlug: string,
    roomPassword?: string
  ): Promise<void> {
    await this.disconnectFromRoom();
    const roomUuid = (await getRoomConfigForClient(roomSlug, this.accessToken))
      ?.uuid;

    if (!roomUuid) {
      return;
    }

    this.socketClient = new SocketClient(SOCKET_URL);

    const { state } = await this.socketClient.joinRoom(this.accessToken, {
      roomUuid,
      password: roomPassword,
    });

    this.botState.setRoomSlug(roomSlug);
    this.botState.setRoomState(state);

    this.configureListener(this.socketClient);
  }

  public async disconnectFromRoom(): Promise<void> {
    this.removeDj();
    this.botState.setRoomSlug(undefined);
    this.botState.setRoomState(undefined);
    if (process.env.NODE_ENV !== "test") {
      await this.delay(1000);
    }

    await this.socketClient?.disconnect();
  }

  public async playPlaylist(playlistId: string): Promise<void> {
    if (this.botState.roomSlug === undefined) {
      console.error("Please connect to the room first");
      return;
    }

    await this.removeDj();

    const tracks = await fetchSpotifyPlaylistTracks(
      playlistId,
      this.spotifyCredentials
    );

    if (!tracks || !tracks.length) {
      console.log("Playlist not found");
      return;
    }

    const songs = this.convertTracksToCrateSongs(tracks);
    this.botState.setSongs(songs);

    this.takeOrLeaveDjSeat();
    this.updateNextSong();
  }

  public async removeDj(): Promise<void> {
    if (this.botState.isBotDj(this.botUuid)) {
      this.socketClient?.action<RemoveDjAction>(ActionName.removeDj);
    }
  }

  public addDj(): void {
    if (this.botState.isBotDj(this.botUuid)) {
      return;
    }
    const song = this.botState.songs[0];

    this.socketClient?.action<AddDjAction>(ActionName.addDj, { song });
  }
}
