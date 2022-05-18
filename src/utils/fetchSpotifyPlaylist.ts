import fetch from "node-fetch";

import { ISpotifyPlaylist } from "../types";

const getSpotifyAccessToken = async (
  spotifyRefreshToken: string,
  spotifyCredentials: string
): Promise<string> => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic  ${spotifyCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=refresh_token&refresh_token=${spotifyRefreshToken}`,
  };

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    options
  );

  const parsedResponse = await response.json();

  return parsedResponse.access_token;
};

export const fetchSpotifyPlaylist = async (
  playlistId: string,
  spotifyRefreshToken: string,
  spotifyCredentials: string
): Promise<ISpotifyPlaylist | undefined> => {
  try {
    const token = await getSpotifyAccessToken(
      spotifyRefreshToken,
      spotifyCredentials
    );

    const options = {
      method: "GET",
      headers: { authorization: `Bearer  ${token}` },
    };

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      options
    );
    const playlist = await response.json();

    return playlist;
  } catch (error) {
    console.log({ msg: "Error in fetchSpotifyPlaylist", error });
  }
};
