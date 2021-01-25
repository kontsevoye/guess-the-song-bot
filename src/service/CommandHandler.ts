import { Message } from "discord.js";
import { AppContext, CommandInterface } from "../types";

export default class CommandHandler {
  constructor(private commands: CommandInterface[]) {}

  async handle(m: Message, ctx: AppContext): Promise<boolean> {
    if (m.author.bot) {
      ctx.logger.debug(`not handling message "${m.content}" from bot`);
      return false;
    }
    const command = this.commands.find((cmd) =>
      cmd.getMatchers().find((matcher) => matcher.isCompatible(m))
    );
    if (!command) {
      return false;
    }

    ctx.logger.debug(
      `message "${m.content}" matched command "${command.getName()}"`
    );
    await command.handle(m, ctx);

    return true;
  }
}
