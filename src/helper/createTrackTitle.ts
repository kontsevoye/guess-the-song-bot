import { Track } from "ym-api/dist/types";

const createTrackTitle = (track: Track) =>
  `${track.artists.map((a) => a.name).join(", ")} - ${track.title}`;

export default createTrackTitle;
