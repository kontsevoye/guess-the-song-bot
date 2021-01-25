import { Track, UrlExtractorInterface } from "ym-api/dist/types";
import { VoiceConnection, Message } from "discord.js";
import { WrappedYMApi } from "ym-api";

export type Playlist = {
  title: string;
  tracks: Track[];
};

export enum MatchEnum {
  None = 1,
  Title,
  Artist,
}

export type Scoreboard = { [key: string]: number };

export interface ChannelStateInterface {
  isPlaying(): boolean;
  setPlaying(playing: boolean): void;
  getPlaylist(): Playlist | null;
  setPlaylist(playlist: Playlist): void;
  getCurrentTrack(): Track | null;
  switchCurrentTrack(): Track | null;
  getCurrentTrackDownloadUrl(): string;
  setCurrentTrackDownloadUrl(currentDownloadUrl: string): void;
  getVoiceConnection(): VoiceConnection | null;
  setVoiceConnection(voiceConnection: VoiceConnection): void;
  isNextTrackAvailable(): boolean;
  getScoreboard(): Scoreboard;
  incrementUserScore(username: string, value?: number): void;
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

export interface FuzzyMatcherInterface {
  match(needle: string, haystack: string[], minScore: number): boolean;
  matchTrack(needle: string, track: Track, minScore: number): MatchEnum;
}

export interface SongServiceInterface {
  createTrackTitle(track: Track): string;
  prettyPrintScoreboard(scoreboard: Scoreboard): string;
}

export type AppContext = {
  state: AppStateInterface;
  ymApi: WrappedYMApi;
  logger: LoggerInterface;
  matcher: FuzzyMatcherInterface;
  songService: SongServiceInterface;
  urlExtractor: UrlExtractorInterface;
};

export interface CommandInterface {
  handle(m: Message, ctx: AppContext): Promise<void>;
  getName(): string;
  getMatchers(): MatcherInterface[];
}
