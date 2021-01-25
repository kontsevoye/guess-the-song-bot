import { Message } from "discord.js";
import shuffle from "lodash/shuffle";
import { StartsWith } from "../matcher";
import { AppContext, CommandInterface, MatcherInterface } from "../types";

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
      ctx.urlExtractor.extractPlaylistId(playlistUrl);
    } catch (e) {
      msg.reply(
        `Can't recognize input, please try \`${
          input[0] || "!gtsplay"
        } {playlist url}\``
      );
      return;
    }
    if (msg.member?.voice.channel) {
      const connection = await msg.member.voice.channel.join();
      ctx.state.getChannelState(msg.channel.id).setVoiceConnection(connection);
    } else {
      msg.reply("You need to join a voice channel first!");
      return;
    }
    msg.reply("Spinning the wheel...");

    const playlist = await ctx.ymApi.getPlaylist(playlistUrl);
    ctx.logger.debug(`fetched playlist with ${playlist.trackCount} tracks`);
    if (!playlist.tracks || playlist.tracks.length < 1) {
      throw new Error("can't play empty playlist");
    }

    ctx.state.getChannelState(msg.channel.id).setPlaylist({
      title: playlist.title,
      tracks: shuffle(playlist.tracks.map((t) => t.track) || []),
    });
    const track = ctx.state.getChannelState(msg.channel.id).getCurrentTrack();
    if (!track) {
      throw new Error("can't start without current track");
    }
    const downloadUrl = await ctx.ymApi.getMp3DownloadUrl(Number(track.id));
    ctx.state
      .getChannelState(msg.channel.id)
      .setCurrentTrackDownloadUrl(downloadUrl);

    ctx.logger.info(
      `playing \`${ctx.songService.createTrackTitle(track)}\` at room ${
        msg.channel.id
      }`
    );

    msg.reply("Can you guess this song?");
    const vc = ctx.state.getChannelState(msg.channel.id).getVoiceConnection();
    if (!vc) {
      throw new Error("can't play track without voice connection");
    }
    vc.play(downloadUrl);
    ctx.state.getChannelState(msg.channel.id).setPlaying(true);
  };
}
