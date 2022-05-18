import { IInitialStateReceived } from "../../types";

export const userUuid_1 = "first-user-uuid";
export const userUuid_2 = "second-user-uuid";

export const initialStateReceivedMock: IInitialStateReceived = {
  djSeats: {
    dataType: "Map",
    value: [
      [
        1,
        {
          avatarId: "avatar-1",
          isBot: false,
          isPlaying: false,
          isReconnecting: false,
          nextTrack: null,
          userUuid: userUuid_1,
          roomServerUserId: null,
        },
      ],
      [
        2,
        {
          avatarId: "avatar-2",
          isBot: false,
          isPlaying: false,
          isReconnecting: false,
          nextTrack: null,
          userUuid: userUuid_2,
          roomServerUserId: null,
        },
      ],
    ],
  },
};
