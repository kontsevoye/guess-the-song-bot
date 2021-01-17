import { Track } from "ym-api/dist/types";
import { VoiceConnection } from "discord.js";

export type Playlist = {
  title: string;
  tracks: Track[];
};

export interface ChannelStateInterface {
  isPlaying(): boolean;
  setPlaying(playing: boolean): void;
  getPlaylistUrl(): string;
  setPlaylistUrl(playlistUrl: string): void;
  getPlaylist(): Playlist;
  setPlaylist(playlist: Playlist): void;
  getCurrentTrack(): Track;
  switchCurrentTrack(): Track;
  getCurrentTrackDownloadUrl(): string;
  setCurrentTrackDownloadUrl(currentDownloadUrl: string): void;
  getVoiceConnection(): VoiceConnection;
  setVoiceConnection(voiceConnection: VoiceConnection): void;
}

export interface AppStateInterface {
  getChannelState(channelId: string): ChannelStateInterface;
  setChannelState(channelId: string, s: ChannelStateInterface): void;
  eraseChannelState(channelId: string): void;
}
