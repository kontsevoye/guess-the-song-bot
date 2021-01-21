import { Message } from "discord.js";
import shuffle from "lodash/shuffle";
import createTrackTitle from "../helper/createTrackTitle";
import { StartsWith } from "../matcher";
import { AppContext, CommandInterface, MatcherInterface } from "../types";
import UrlExtractor from "../UrlExtractor";

export default class PlayCommand implements CommandInterface {
  getName = (): string => "play";

  getMatchers = (): MatcherInterface[] => [
    new StartsWith("!play"),
    new StartsWith("!start"),
    new StartsWith("!gtsplay"),
    new StartsWith("!gtsstart"),
  ];

  handle = async (msg: Message, ctx: AppContext): Promise<void> => {
    if (ctx.state.getChannelState(msg.channel.id).isPlaying()) {
      msg.reply("already playing");
      return;
    }
    const input = msg.content.split(" ");
    if (input.length !== 2) {
      msg.reply(
        `Can't recognize input, please try \`${
          input[0] || "!gtsplay"
        } {playlist url}\``
      );
      return;
    }
    const playlistUrl = input.pop() as string;
    try {
      new UrlExtractor().extractPlaylistId(playlistUrl);
    } catch (e) {
      msg.reply(
        `Can't recognize input, please try \`${
          input[0] || "!gtsplay"
        } {playlist url}\``
      );
      return;
    }
    if (msg.member?.voice.channel) {
      const connection = await msg.member?.voice.channel.join();
      ctx.state.getChannelState(msg.channel.id).setVoiceConnection(connection);
    } else {
      msg.reply("You need to join a voice channel first!");
      return;
    }
    msg.reply("Spinning the wheel...");

    const playlist = await ctx.ymApi.getPlaylist(playlistUrl);

    ctx.logger.debug(`fetched playlist with ${playlist.trackCount} tracks`);

    ctx.state.getChannelState(msg.channel.id).setPlaylist({
      title: playlist.title,
      tracks: shuffle(playlist.tracks?.map((t) => t.track) || []),
    });
    const track = ctx.state.getChannelState(msg.channel.id).getCurrentTrack();
    const downloadUrl = await ctx.ymApi.getMp3DownloadUrl(Number(track.id));
    ctx.state
      .getChannelState(msg.channel.id)
      .setCurrentTrackDownloadUrl(downloadUrl);

    ctx.logger.info(
      `playing \`${createTrackTitle(track)}\` at room ${msg.channel.id}`
    );

    ctx.state.getChannelState(msg.channel.id).setPlaying(true);
    msg.reply("Can you guess this song?");
    ctx.state
      .getChannelState(msg.channel.id)
      .getVoiceConnection()
      .play(downloadUrl);
  };
}
