import { Message } from "discord.js";
import { Any, StartsWith } from "../matcher";
import {
  AppContext,
  CommandInterface,
  MatchEnum,
  MatcherInterface,
} from "../types";

export default class GuessCommand implements CommandInterface {
  getName = (): string => "guess";

  getMatchers = (): MatcherInterface[] => [
    new StartsWith("!guess"),
    new StartsWith("!gtsguess"),
    new Any(),
  ];

  async handle(msg: Message, ctx: AppContext): Promise<void> {
    if (!ctx.state.getChannelState(msg.channel.id).isPlaying()) {
      return;
    }
    try {
      ctx.state.getChannelState(msg.channel.id).getCurrentTrack();
    } catch (e) {
      msg.reply("Wait until the game starts");
      return;
    }
    const guess = this.getMatchers()
      .map((matcher) => matcher.getCmp())
      .reduce((acc, val) => acc.replace(val, ""), msg.content)
      .trim();
    if (guess.length < 1) {
      msg.reply(
        `Can't recognize input, please try enter just a song name like this \`Sandstorm\``
      );
      return;
    }
    const vc = ctx.state.getChannelState(msg.channel.id).getVoiceConnection();
    if (!vc) {
      throw new Error("can't guess track without voice connection");
    }
    const track = ctx.state.getChannelState(msg.channel.id).getCurrentTrack();
    if (!track) {
      throw new Error("can't guess without current track");
    }
    const match = ctx.matcher.matchTrack(guess, track, 0.8);
    ctx.logger.debug(`comparing ${guess} and ${track.title}`, { track, match });
    if (match !== MatchEnum.None) {
      const scorePoints = match === MatchEnum.Title ? 2 : 1;
      const matchType = match === MatchEnum.Title ? "title" : "artist";
      ctx.state
        .getChannelState(msg.channel.id)
        .incrementUserScore(
          msg.author.username,
          scorePoints
        );
      vc.dispatcher.pause();
      if (!ctx.state.getChannelState(msg.channel.id).isNextTrackAvailable()) {
        vc.disconnect();
        const scoreboard = ctx.state
          .getChannelState(msg.channel.id)
          .getScoreboard();
        ctx.state.eraseChannelState(msg.channel.id);
        msg.reply(
          `You goddamn right, it is \`${ctx.songService.createTrackTitle(
            track
          )}\`, you've got ${scorePoints} points for guessing ${matchType}.\nThat's all, see you later!`
        );
        msg.channel.send(ctx.songService.prettyPrintScoreboard(scoreboard));
        return;
      }

      msg.reply(
        `You goddamn right, it is \`${ctx.songService.createTrackTitle(
          track
        )}\`, you've got ${scorePoints} points for guessing ${matchType}.`
      );
      const newTrack = ctx.state
        .getChannelState(msg.channel.id)
        .switchCurrentTrack();
      if (!newTrack) {
        throw new Error("can't continue without next track");
      }
      const downloadUrl = await ctx.ymApi.getMp3DownloadUrl(
        Number(newTrack.id)
      );
      ctx.state
        .getChannelState(msg.channel.id)
        .setCurrentTrackDownloadUrl(downloadUrl);

      ctx.logger.info(
        `playing \`${ctx.songService.createTrackTitle(newTrack)}\` at room ${
          msg.channel.id
        }`
      );
      ctx.state.getChannelState(msg.channel.id).setPlaying(true);
      msg.reply("Can you guess this song?");
      vc.play(downloadUrl);
    } else {
      msg.reply("Bad luck");
    }
  }
}
