import { VoiceConnection } from "discord.js";
import { Track } from "ym-api/dist/types";
import { ChannelStateInterface, Playlist } from "../../types";

export default class ChannelState implements ChannelStateInterface {
  private playing: boolean = false;

  private playlistUrl: string = "";

  private playlist: Playlist = { title: "", tracks: [] };

  private current?: Track;

  private currentDownloadUrl: string = "";

  private voiceConnection?: VoiceConnection;

  isPlaying(): boolean {
    return this.playing;
  }

  setPlaying(playing: boolean): void {
    this.playing = playing;
  }

  getPlaylistUrl(): string {
    return this.playlistUrl;
  }

  setPlaylistUrl(playlistUrl: string): void {
    this.playlistUrl = playlistUrl;
  }

  getPlaylist(): Playlist {
    return this.playlist;
  }

  setPlaylist(playlist: Playlist): void {
    this.playlist = playlist;
  }

  getCurrentTrack(): Track {
    if (this.playlist.tracks.length < 1 && !this.current) {
      throw new Error("ne otkuda brat");
    }
    if (!this.current) {
      this.current = this.playlist.tracks.pop() as Track;
    }

    return this.current;
  }

  switchCurrentTrack(): Track {
    if (this.playlist.tracks.length < 1) {
      throw new Error("ne otkuda brat");
    }
    this.current = this.playlist.tracks.pop() as Track;

    return this.current;
  }

  getCurrentTrackDownloadUrl(): string {
    return this.currentDownloadUrl;
  }

  setCurrentTrackDownloadUrl(currentDownloadUrl: string): void {
    this.currentDownloadUrl = currentDownloadUrl;
  }

  getVoiceConnection(): VoiceConnection {
    if (!this.voiceConnection) {
      throw new Error("ne otkuda brat");
    }
    return this.voiceConnection;
  }

  setVoiceConnection(voiceConnection: VoiceConnection): void {
    this.voiceConnection = voiceConnection;
  }

  isNextTrackAvailable(): boolean {
    return this.playlist.tracks.length > 0;
  }
}
