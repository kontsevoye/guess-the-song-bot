import { Message } from "discord.js";
import { StartsWith } from "../matcher";
import { AppContext, CommandInterface, MatcherInterface } from "../types";

export default class StopCommand implements CommandInterface {
  getName = (): string => "stop";

  getMatchers = (): MatcherInterface[] => [
    new StartsWith("!stop"),
    new StartsWith("!gtsstop"),
  ];

  handle = async (msg: Message, ctx: AppContext): Promise<void> => {
    if (!ctx.state.getChannelState(msg.channel.id).isPlaying()) {
      msg.reply("already stopped");
      return;
    }
    ctx.state.getChannelState(msg.channel.id).getVoiceConnection().disconnect();
    ctx.state.eraseChannelState(msg.channel.id);
    msg.reply("stopped");
  };
}
