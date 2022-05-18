import { ISpotifyPlaylist } from "../../types";

export const mockedSpotifyResponse: ISpotifyPlaylist = {
  tracks: {
    items: [
      {
        track: {
          artists: [{ name: "artist-name-1" }],
          duration_ms: 10.1,
          id: "test-id-1",
          external_ids: {
            isrc: "test-isrc-1",
          },
          name: "test-name-1",
        },
      },
      {
        track: {
          artists: [{ name: "artist-name-2" }],
          duration_ms: 200.56,
          id: "test-id-2",
          external_ids: {
            isrc: "test-isrc-2",
          },
          name: "test-name-2",
        },
      },
    ],
  },
};
