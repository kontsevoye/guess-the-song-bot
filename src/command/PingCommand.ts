import { Message } from "discord.js";
import { StartsWith } from "../matcher";
import { CommandInterface, MatcherInterface } from "../types";

export default class PingCommand implements CommandInterface {
  getName = (): string => "ping";

  getMatchers = (): MatcherInterface[] => [
    new StartsWith("ping"),
    new StartsWith("!ping"),
    new StartsWith("!gtsping"),
  ];

  handle = async (m: Message): Promise<void> => {
    m.reply(`Channel ID ${m.channel.id} type ${m.channel.type}`);
  };
}
