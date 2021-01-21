import { Message } from "discord.js";
import FuzzySet from "fuzzyset.js";
import createTrackTitle from "../helper/createTrackTitle";
import { Any, StartsWith } from "../matcher";
import { AppContext, CommandInterface, MatcherInterface } from "../types";

export default class GuessCommand implements CommandInterface {
  getName = (): string => "guess";

  getMatchers = (): MatcherInterface[] => [
    new StartsWith("!guess"),
    new StartsWith("!gtsguess"),
    new Any(),
  ];

  async handle(msg: Message, ctx: AppContext): Promise<void> {
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
    const track = ctx.state.getChannelState(msg.channel.id).getCurrentTrack();
    const fset = FuzzySet([track.title]);
    const match = fset.get(guess, [], 0.8);
    ctx.logger.debug(`comparing ${guess} and ${track.title}`, { match });
    if (match?.length && match.length >= 1) {
      if (!ctx.state.getChannelState(msg.channel.id).isNextTrackAvailable()) {
        ctx.state
          .getChannelState(msg.channel.id)
          .getVoiceConnection()
          .disconnect();
        ctx.state.eraseChannelState(msg.channel.id);
        msg.reply(
          `You goddamn right, it is \`${createTrackTitle(
            track
          )}\`.\nThat's all, see you later!`
        );
        return;
      }

      msg.reply(`You goddamn right, it is \`${createTrackTitle(track)}\``);
      const newTrack = ctx.state
        .getChannelState(msg.channel.id)
        .switchCurrentTrack();
      const downloadUrl = await ctx.ymApi.getMp3DownloadUrl(
        Number(newTrack.id)
      );
      ctx.state
        .getChannelState(msg.channel.id)
        .setCurrentTrackDownloadUrl(downloadUrl);

      ctx.logger.info(
        `playing \`${createTrackTitle(newTrack)}\` at room ${msg.channel.id}`
      );
      ctx.state.getChannelState(msg.channel.id).setPlaying(true);
      msg.reply("Can you guess this song?");
      ctx.state
        .getChannelState(msg.channel.id)
        .getVoiceConnection()
        .play(downloadUrl);
    } else {
      msg.reply("Bad luck");
    }
  }
}
