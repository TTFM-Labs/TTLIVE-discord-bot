import fetch from "node-fetch";

import { USER_SERVICE_URL } from "../const";

export interface UserProfile {
  avatarId: string;
  uuid: string;
}

export const getUserProfile = async (
  accessToken: string
): Promise<UserProfile> => {
  const options = {
    method: "GET",
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  };

  const response = await fetch(`${USER_SERVICE_URL}/users/profile`, options);
  const userProfile = await response.json();

  return userProfile;
};
