export enum BotMessages {
  CONNECT = "connect",
  PLAY_PLAYLIST = "playplaylist",
  LEAVE_DJ_SEAT = "leavedj",
  DISCONNECT = "disconnect",
  STATUS = "status",
  CHANGE_MODE = "changemode",
  TAKE_DJ_SEAT = "takedj",
}

export type Song = {
  artistName: string;
  duration: number;
  genre: string;
  id: string;
  isrc: string | undefined;
  musicProvider: "spotify";
  trackName: string;
  trackUrl: string;
};

export enum SocketMessages {
  takeDjSeat = "takeDjSeat",
  leaveDjSeat = "leaveDjSeat",
  skipDjTrack = "skipDjTrack",
  userWasDisconnected = "userWasDisconnected",
  addAvatarToDancefloor = "addAvatarToDancefloor",
  sendNextTrackToPlay = "sendNextTrackToPlay",
  playNextSong = "playNextSong",
  sendInitialState = "sendInitialState",
  sendSatisfaction = "sendSatisfaction",
  startConnection = "startConnection",
  userConnectionLost = "userConnectionLost",
  userDisconnected = "user:disconnected",
  wrongMessagePayload = "wrongMessagePayload",
}

export type ValueMapWrapper<K, T> = {
  dataType: "Map";
  value: [K, T][];
};

export type DjSeat = {
  avatarId: string | null;
  isBot: boolean;
  isPlaying: boolean;
  isReconnecting: boolean;
  nextTrack: { song: Song } | null;
  userUuid: string | null;
  roomServerUserId: number | null;
};

export interface IInitialStateReceived {
  djs: DjSeat[];
}

export interface ITakeDjSeat {
  userUuid: string;
  djs: DjSeat[];
}

export interface ILeaveDjSeat {
  userUuid: string;
  djs: DjSeat[];
}

export interface ISpotifyTrack {
  track: {
    artists: [{ name: string }];
    duration_ms: number;
    id: string;
    external_ids: {
      isrc: string;
    };
    name: string;
  };
}
export interface ISpotifyPlaylist {
  tracks: {
    items: ISpotifyTrack[];
  };
}

export type BotMode = "testing" | "bot";

export interface IConfig {
  discord_token: string;
  spotify_refresh_token: string;
  spotify_credentials: string;
  email: string;
  password: string;
}
