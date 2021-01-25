import { VoiceConnection } from "discord.js";
import { Track } from "ym-api/dist/types";
import { ChannelStateInterface, Playlist, Scoreboard } from "../../types";

export default class ChannelState implements ChannelStateInterface {
  private playing: boolean = false;

  private playlist: Playlist | null = null;

  private current: Track | null = null;

  private currentDownloadUrl: string = "";

  private voiceConnection: VoiceConnection | null = null;

  private scoreboard: Scoreboard = {};

  isPlaying(): boolean {
    return this.playing;
  }

  setPlaying(playing: boolean): void {
    this.playing = playing;
  }

  getPlaylist(): Playlist | null {
    return this.playlist;
  }

  setPlaylist(playlist: Playlist): void {
    this.playlist = playlist;
  }

  getCurrentTrack(): Track | null {
    if (this.current) {
      return this.current;
    }

    return this.switchCurrentTrack();
  }

  switchCurrentTrack(): Track | null {
    if (!this.playlist || !this.isNextTrackAvailable()) {
      return null;
    }
    const track = this.playlist.tracks.pop();
    if (!track) {
      return null;
    }
    this.current = track;

    return this.current;
  }

  getCurrentTrackDownloadUrl(): string {
    return this.currentDownloadUrl;
  }

  setCurrentTrackDownloadUrl(currentDownloadUrl: string): void {
    this.currentDownloadUrl = currentDownloadUrl;
  }

  getVoiceConnection(): VoiceConnection | null {
    return this.voiceConnection;
  }

  setVoiceConnection(voiceConnection: VoiceConnection): void {
    this.voiceConnection = voiceConnection;
  }

  isNextTrackAvailable(): boolean {
    if (!this.playlist) {
      return false;
    }

    return this.playlist.tracks.length > 0;
  }

  getScoreboard(): Scoreboard {
    return this.scoreboard;
  }

  incrementUserScore(username: string, value: number = 1): void {
    if (!this.scoreboard[username]) {
      this.scoreboard[username] = value;
      return;
    }

    this.scoreboard[username] += value;
  }
}
