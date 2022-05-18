import fetch from "node-fetch";

import { userServiceApiBaseUrl } from "../const";

export interface ILoginReq {
  email: string;
  password: string;
}

export interface ILoginRes {
  accessToken: string;
}

export const logIn = async (params: ILoginReq): Promise<ILoginRes> => {
  const requestBody = {
    email: params.email,
    password: params.password,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  };

  const response = await fetch(`${userServiceApiBaseUrl}/auth/login`, options);
  const res = await response.json();

  return res;
};
