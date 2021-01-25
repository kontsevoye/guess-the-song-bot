import { Message } from "discord.js";
import { StartsWith } from "../matcher";
import { AppContext, CommandInterface, MatcherInterface } from "../types";

export default class ScoreCommand implements CommandInterface {
  getName = (): string => "score";

  getMatchers = (): MatcherInterface[] => [
    new StartsWith("score"),
    new StartsWith("!score"),
    new StartsWith("!gtsscore"),
  ];

  handle = async (m: Message, ctx: AppContext): Promise<void> => {
    m.reply(
      ctx.songService.prettyPrintScoreboard(
        ctx.state.getChannelState(m.channel.id).getScoreboard()
      )
    );
  };
}
