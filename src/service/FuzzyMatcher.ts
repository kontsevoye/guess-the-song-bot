import FuzzySet from "fuzzyset.js";
import { Track } from "ym-api/dist/types";
import { FuzzyMatcherInterface, MatchEnum } from "../types";

export default class FuzzyMatcher implements FuzzyMatcherInterface {
  match = (needle: string, haystack: string[], minScore: number): boolean => {
    const fset = FuzzySet(haystack);
    const match = fset.get(needle, [], minScore) as never[];

    return match.length >= 1;
  };

  matchTrack(needle: string, track: Track, minScore: number): MatchEnum {
    if (this.match(needle, [track.title], minScore)) {
      return MatchEnum.Title;
    }
    if (
      this.match(
        needle,
        track.artists.map((a) => a.name),
        minScore
      )
    ) {
      return MatchEnum.Artist;
    }

    return MatchEnum.None;
  }
}
