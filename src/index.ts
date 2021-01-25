import Discord from "discord.js";
import { WrappedYMApi } from "ym-api";
import { AppState } from "./state/in-memory";
import {
  PingCommand,
  PlayCommand,
  GuessCommand,
  StopCommand,
  SkipCommand,
  HelpCommand,
  ScoreCommand,
} from "./command";
import {
  UrlExtractor,
  SongService,
  FuzzyMatcher,
  CommandHandler,
  Logger,
} from "./service";

const ymApi = new WrappedYMApi();
const client = new Discord.Client();
const state = new AppState();
const commandHandler = new CommandHandler([
  new PingCommand(),
  new PlayCommand(),
  new StopCommand(),
  new SkipCommand(),
  new ScoreCommand(),
  new HelpCommand(),
  new GuessCommand(),
]);
const logger = new Logger();
const matcher = new FuzzyMatcher();
const songService = new SongService();
const urlExtractor = new UrlExtractor();

(async () => {
  try {
    await ymApi.init({
      uid: Number(process.env.YM_UID),
      access_token: process.env.YM_ACCESS_TOKEN,
    });
  } catch (e) {
    logger.error(`ym api error ${e.message}`);
    process.exit(1);
  }

  client.on("ready", () => {
    logger.info(`logged in as ${client?.user?.tag}!`);
  });

  client.on("message", async (msg) => {
    try {
      if (!msg.guild) {
        msg.reply("Sorry, but this bot works only in guilds");
        return;
      }

      await commandHandler.handle(msg, {
        state,
        ymApi,
        logger,
        matcher,
        songService,
        urlExtractor,
      });
    } catch (e) {
      logger.error(`some error occured: ${e.message}`, e);
    }
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
})();
