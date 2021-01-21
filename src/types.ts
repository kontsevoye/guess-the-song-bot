import { Track } from "ym-api/dist/types";
import { VoiceConnection, Message } from "discord.js";
import { WrappedYMApi } from "ym-api";

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
  isNextTrackAvailable(): boolean;
}

export interface AppStateInterface {
  getChannelState(channelId: string): ChannelStateInterface;
  setChannelState(channelId: string, s: ChannelStateInterface): void;
  eraseChannelState(channelId: string): void;
}

export interface MatcherInterface {
  getCmp(): string;
  isCompatible(m: Message): boolean;
}

export interface LoggerInterface {
  error(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  info(message: string, ...meta: any[]): void;
  http(message: string, ...meta: any[]): void;
  verbose(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
  silly(message: string, ...meta: any[]): void;
}

export type AppContext = {
  state: AppStateInterface;
  ymApi: WrappedYMApi;
  logger: LoggerInterface;
};

export interface CommandInterface {
  handle(m: Message, ctx: AppContext): Promise<void>;
  getName(): string;
  getMatchers(): MatcherInterface[];
}
