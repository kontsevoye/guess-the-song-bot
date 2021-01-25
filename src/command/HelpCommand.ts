import { Message } from "discord.js";
import { StartsWith } from "../matcher";
import { CommandInterface, MatcherInterface } from "../types";

export default class HelpCommand implements CommandInterface {
  getName = (): string => "help";

  getMatchers = (): MatcherInterface[] => [
    new StartsWith("help"),
    new StartsWith("!help"),
    new StartsWith("!gtshelp"),
  ];

  handle = async (m: Message): Promise<void> => {
    m.reply(
      "Guess the Song bot commands:\n".concat(
        "`!play {playlist url}` - start the game with the given palylist\n",
        "`!stop` - manually stop the game\n",
        "`!skip` - skip unknown track\n",
        "`!score` - print current score\n",
        "`song name` - guess the song while playing without any prefixes, e.g. `Sandstorm`\n"
      )
    );
  };
}
