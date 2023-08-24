import fetch from "node-fetch";

import { ROOMS_SERVICE_URL } from "../const";

export interface RoomDto {
  uuid: string;
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
      `${ROOMS_SERVICE_URL}/rooms/${roomSlug}/join`,
      options
    );
    const roomConfig = await response.json();

    return roomConfig;
  } catch (error) {
    console.log({ msg: "Error in getRoomConfigForClient", error });
  }
};
