import Discord from "discord.js";
import { WrappedYMApi } from "ym-api";
import shuffle from "lodash/shuffle";
import FuzzySet from "fuzzyset.js";
import AppState from "./state/in-memory/AppState";

const ymApi = new WrappedYMApi();
const client = new Discord.Client();
const state = new AppState();

(async () => {
  try {
    await ymApi.init({
      uid: Number(process.env.YM_UID),
      access_token: process.env.YM_ACCESS_TOKEN,
    });
  } catch (e) {
    console.error(`ym api error ${e.message}`);
    process.exit(1);
  }

  client.on("ready", () => {
    console.log(`Logged in as ${client?.user?.tag}!`);
  });

  client.on("message", async (msg) => {
    try {
      // Voice only works in guilds, if the message does not come from a guild,
      // we ignore it
      if (!msg.guild) {
        console.log("not a guild");
        return;
      }

      if (msg.content === "ping") {
        msg.reply(`Channel ID ${msg.channel.id} type ${msg.channel.type}`);
      } else if (msg.content.startsWith("!gtsplay")) {
        if (state.getChannelState(msg.channel.id).isPlaying()) {
          msg.reply("already playing");
          return;
        }
        const input = msg.content.split(" ");
        if (input.length !== 2) {
          msg.reply("chto za chepuxa");
          return;
        }
        if (msg.member?.voice.channel) {
          const connection = await msg.member?.voice.channel.join();
          state.getChannelState(msg.channel.id).setVoiceConnection(connection);
        } else {
          msg.reply("You need to join a voice channel first!");
          return;
        }
        msg.reply("spinning wheel...");
        const playlistUrl = input.pop() as string;
        const playlist = await ymApi.getPlaylist(playlistUrl);
        state.getChannelState(msg.channel.id).setPlaylist({
          title: playlist.title,
          tracks: shuffle(playlist.tracks?.map((t) => t.track) || []),
        });
        const track = state.getChannelState(msg.channel.id).getCurrentTrack();
        const downloadUrl = await ymApi.getMp3DownloadUrl(Number(track.id));
        state
          .getChannelState(msg.channel.id)
          .setCurrentTrackDownloadUrl(downloadUrl);
        console.log(track, downloadUrl);
        state.getChannelState(msg.channel.id).setPlaying(true);
        msg.reply("some background magic done, go play");
        state.getChannelState(msg.channel.id).getVoiceConnection().play(downloadUrl);
      } else if (msg.content.startsWith("!gtsguess")) {
        const input = msg.content.split(" ");
        if (input.length < 2) {
          msg.reply("chto za chepuxa");
          return;
        }
        const guess = input.slice(1).join(" ");
        const track = state.getChannelState(msg.channel.id).getCurrentTrack();
        const fset = FuzzySet([track.title]);
        const match = fset.get(guess, [], 0.8);
        console.log(
          `comparing ${guess} and ${track.title}`,
          match,
          match?.length,
        );
        if (match?.length && match.length >= 1) {
          msg.reply(
            `You goddamn right, it is \`${track.artists
              .map((a) => a.name)
              .join(", ")} - ${track.title}\``
          );
          const newTrack = state
            .getChannelState(msg.channel.id)
            .switchCurrentTrack();
          const downloadUrl = await ymApi.getMp3DownloadUrl(
            Number(newTrack.id)
          );
          state
            .getChannelState(msg.channel.id)
            .setCurrentTrackDownloadUrl(downloadUrl);
          console.log(newTrack, downloadUrl);
          state.getChannelState(msg.channel.id).setPlaying(true);
          msg.reply("some background magic done, go play");
          state.getChannelState(msg.channel.id).getVoiceConnection().play(downloadUrl);
        } else {
          msg.reply("sosatb");
        }
      } else if (msg.content.startsWith("!gtsstop")) {
        if (!state.getChannelState(msg.channel.id).isPlaying()) {
          msg.reply("already stopped");
          return;
        }
        state.eraseChannelState(msg.channel.id);
        msg.reply("go stop");
        state.getChannelState(msg.channel.id).getVoiceConnection().disconnect();
      } else if (msg.content.startsWith("!gtsskip")) {
        const newTrack = state
          .getChannelState(msg.channel.id)
          .switchCurrentTrack();
        const downloadUrl = await ymApi.getMp3DownloadUrl(Number(newTrack.id));
        state
          .getChannelState(msg.channel.id)
          .setCurrentTrackDownloadUrl(downloadUrl);
        console.log(newTrack, downloadUrl);
        state.getChannelState(msg.channel.id).setPlaying(true);
        msg.reply("some background magic done, go play");
        state.getChannelState(msg.channel.id).getVoiceConnection().play(downloadUrl);
      }
    } catch (e) {
      console.error(`some error occured: ${e.message}`, e);
    }
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
})();
