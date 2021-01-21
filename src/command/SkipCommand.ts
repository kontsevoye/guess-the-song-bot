import { Message } from "discord.js";
import createTrackTitle from "../helper/createTrackTitle";
import { StartsWith } from "../matcher";
import { AppContext, CommandInterface, MatcherInterface } from "../types";

export default class SkipCommand implements CommandInterface {
  getName = (): string => "skip";

  getMatchers = (): MatcherInterface[] => [
    new StartsWith("!skip"),
    new StartsWith("!gtsskip"),
  ];

  handle = async (msg: Message, ctx: AppContext): Promise<void> => {
    try {
      ctx.state.getChannelState(msg.channel.id).getCurrentTrack();
    } catch (e) {
      msg.reply("Wait until the game starts");
      return;
    }
    const oldTrack = ctx.state
      .getChannelState(msg.channel.id)
      .getCurrentTrack();
    if (!ctx.state.getChannelState(msg.channel.id).isNextTrackAvailable()) {
      ctx.state
        .getChannelState(msg.channel.id)
        .getVoiceConnection()
        .disconnect();
      ctx.state.eraseChannelState(msg.channel.id);
      msg.reply(
        `That was \`${createTrackTitle(
          oldTrack
        )}\`.\nThat's all, see you later!`
      );
      return;
    }

    msg.reply(
      `That was \`${createTrackTitle(oldTrack)}\`. Can you gess the next song?`
    );
    const newTrack = ctx.state
      .getChannelState(msg.channel.id)
      .switchCurrentTrack();
    const downloadUrl = await ctx.ymApi.getMp3DownloadUrl(Number(newTrack.id));
    ctx.state
      .getChannelState(msg.channel.id)
      .setCurrentTrackDownloadUrl(downloadUrl);

    ctx.logger.info(
      `playing \`${createTrackTitle(newTrack)}\` at room ${msg.channel.id}`
    );

    ctx.state.getChannelState(msg.channel.id).setPlaying(true);
    ctx.state
      .getChannelState(msg.channel.id)
      .getVoiceConnection()
      .play(downloadUrl);
  };
}
