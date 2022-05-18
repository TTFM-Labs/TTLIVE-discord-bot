# TTFM Bot

TTFM discord bot built with [discord.js](https://discord.js.org/#/)

## Running the bot

1. Install dependencies

```
npm i
```

2. Add credentials and tokens to `config.ts` file

```
export const config: IConfig = {
  discord_token: "xxx....."
  spotify_refresh_token: "xxx..."
  ......
```

3.Start application

```
npm run start
```

## Bot commads:

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
!playPlaylist <botNumber> <playlistId> <DjseatNumber>
```

Play selected playlist

```
!leaveDJ <botNumber>
```

To leave the dj seat use the bot

```
!takeDJ <botNumber> <DjseatNumber>
```

To take the dj seat use the bot number and dj seat number

```
!changeMode <bot> | <testing>
```
