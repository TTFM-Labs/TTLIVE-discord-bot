import fetch from "node-fetch";

import {
  ISpotifyPlaylist,
  ISpotifyPlaylistTracks,
  ISpotifyTrack,
} from "../types";

const getSpotifyAccessToken = async (
  spotifyCredentials: string
): Promise<string> => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic ${spotifyCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials`,
  };

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    options
  );

  const parsedResponse = await response.json();

  return parsedResponse.access_token;
};

export const fetchSpotifyPlaylistTracks = async (
  playlistId: string,
  spotifyCredentials: string
): Promise<ISpotifyTrack[]> => {
  const tracks: ISpotifyTrack[] = [];
  let token: string | undefined;
  let url:
    | string
    | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  try {
    token = await getSpotifyAccessToken(spotifyCredentials);
  } catch (error) {
    console.log({ msg: "Error fetching spotify token", error });
  }

  if (token) {
    while (url) {
      try {
        const options = {
          method: "GET",
          headers: { authorization: `Bearer ${token}` },
        };

        const response = await fetch(url, options);
        const playlist = (await response.json()) as ISpotifyPlaylistTracks;

        if (playlist.items?.length) {
          tracks.push(...playlist.items);
        }
        url = playlist.next;
      } catch (error) {
        console.log({ msg: "Error in fetchSpotifyPlaylist", error });
        url = null;
      }
    }
  }

  return tracks;
};
