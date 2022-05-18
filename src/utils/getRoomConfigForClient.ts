import fetch from "node-fetch";

import { roomsServiceApiBaseUrl } from "../const";

export interface RoomDto {
  socketDomain: string;
  socketPath: string;
}

export const getRoomConfigForClient = async (
  roomSlug: string,
  accessToken: string
): Promise<RoomDto | undefined> => {
  const options = {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const response = await fetch(
      `${roomsServiceApiBaseUrl}/rooms/${roomSlug}/join`,
      options
    );
    const roomConfig = await response.json();

    return roomConfig;
  } catch (error) {
    console.log({ msg: "Error in getRoomConfigForClient", error });
  }
};
