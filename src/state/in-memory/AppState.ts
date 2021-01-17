import { AppStateInterface, ChannelStateInterface } from "../../types";
import ChannelState from "./ChannelState";

export default class AppState implements AppStateInterface {
  private channels: { [key: string]: ChannelStateInterface } = {};

  getChannelState(channelId: string): ChannelStateInterface {
    if (!this.channels[channelId]) {
      this.channels[channelId] = new ChannelState();
    }
    return this.channels[channelId];
  }

  setChannelState(channelId: string, s: ChannelStateInterface): void {
    this.channels[channelId] = s;
  }

  eraseChannelState(channelId: string): void {
    this.channels[channelId] = new ChannelState();
  }
}
