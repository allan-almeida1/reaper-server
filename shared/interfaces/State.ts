import type { Marker } from "./Marker";
import type { Track } from "./Track";

export interface State {
  tracks: Track[];
  markers: Marker[];
  transport: {
    state: "play" | "pause" | "stop";
    position: number;
  };
}
