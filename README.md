# Turntable LIVE Bot

Turntable LIVE Discord bot built with [discord.js](https://discord.js.org/#/)

- [Turntable LIVE Bot](#turntable-live-bot)
  - [Running the Bot](#running-the-bot)
  - [Bot Commands](#bot-commands)
  - [Additional Info](#additional-info)

## Running the Bot

1. Install dependencies

```
npm i
```

2. Add credentials and tokens to `config.ts` file

```
export const config: IConfig = {
  discord_token: "xxx....."
  spotify_credentials: "{client_id}:{client_secret}" (base64 encoded)
  email: {tt.live email},
  password: {tt.live password}
  ......
```

3.Start application

```
npm run start
```

## Bot Commands

```
!status
```

Returns the current status of all bots

```
!connect <botNumber>  <roomName>
```

To connect to a room, use the bot number and the room slug

```
!connect <botNumber>  <roomName> <roomPassword>
```

To connect to password protected room, use the bot number, the room slug and the room password

```
!disconnect <botNumber>
```

To disconect from the room use the bot number

```
!playPlaylist <botNumber> <playlistId>
```

Play selected playlist

```
!leaveDJ <botNumber>
```

To leave the dj seat use the bot

```
!takeDJ <botNumber>

To take the dj seat use the bot number and dj seat number

```

!changeMode <bot> | <testing>

```

```

## Additional Info

For more information on the `ttfm-socket` package that handles connecting to rooms, [see here](https://www.npmjs.com/package/ttfm-socket).
