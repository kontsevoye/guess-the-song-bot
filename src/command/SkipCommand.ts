import { Message } from "discord.js";
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
    if (!oldTrack) {
      msg.reply("Wait until the game starts");
      return;
    }
    const vc = ctx.state.getChannelState(msg.channel.id).getVoiceConnection();
    if (!vc) {
      throw new Error("can't skip without voice connection");
    }
    vc.dispatcher.pause();
    if (!ctx.state.getChannelState(msg.channel.id).isNextTrackAvailable()) {
      vc.disconnect();
      const scoreboard = ctx.state
        .getChannelState(msg.channel.id)
        .getScoreboard();
      ctx.state.eraseChannelState(msg.channel.id);
      msg.reply(
        `That was \`${ctx.songService.createTrackTitle(
          oldTrack
        )}\`.\nThat's all, see you later!`
      );
      msg.channel.send(ctx.songService.prettyPrintScoreboard(scoreboard));
      return;
    }

    msg.reply(
      `That was \`${ctx.songService.createTrackTitle(
        oldTrack
      )}\`. Can you gess the next song?`
    );
    const newTrack = ctx.state
      .getChannelState(msg.channel.id)
      .switchCurrentTrack();
    if (!newTrack) {
      throw new Error("can't continue without next track");
    }
    const downloadUrl = await ctx.ymApi.getMp3DownloadUrl(Number(newTrack.id));
    ctx.state
      .getChannelState(msg.channel.id)
      .setCurrentTrackDownloadUrl(downloadUrl);

    ctx.logger.info(
      `playing \`${ctx.songService.createTrackTitle(newTrack)}\` at room ${
        msg.channel.id
      }`
    );

    vc.play(downloadUrl);
    ctx.state.getChannelState(msg.channel.id).setPlaying(true);
  };
}
