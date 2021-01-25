import { Track } from "ym-api/dist/types";
import { Scoreboard, SongServiceInterface } from "../types";

export default class SongService implements SongServiceInterface {
  createTrackTitle = (track: Track): string =>
    `${track.artists.map((a) => a.name).join(", ")} - ${track.title}`;

  prettyPrintScoreboard = (scoreboard: Scoreboard): string =>
    Object.entries(scoreboard).length > 0
      ? Object.entries(scoreboard)
          .sort((a, b) => a[1] - b[1])
          .reduce(
            (carry, item, index) =>
              `${carry}\n${index + 1}. \`${item[0]}\` — ${item[1]} points`,
            "Scoreboard:"
          )
      : "Empty Scoreboard";
}
