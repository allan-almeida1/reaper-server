import type { Marker } from "./Marker";
import { Project } from "./Project";
import type { Track } from "./Track";

export interface State {
  tracks: Track[];
  markers: Marker[];
  transport: {
    state: "play" | "pause" | "stop";
    position: number;
  };
  currentProject?: Project;
}
