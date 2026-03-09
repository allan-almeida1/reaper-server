import { WebSocketServer, WebSocket } from "ws";
import { ReaperControllerInterface } from "./interfaces/ReaperController.interface";
import type { State, Track, Project } from "@reaper/shared";

export function createWsServer(
  wss: WebSocketServer,
  reaper: ReaperControllerInterface,
  projects: Project[],
) {
  wss.on("connection", async (ws: WebSocket) => {
    const state = await reaper.getState();
    ws.send(JSON.stringify({ type: "state", data: state }));
    ws.send(JSON.stringify({ type: "projects", data: projects }));

    ws.on("message", (message: string) => {
      const cmd = JSON.parse(message);

      if (cmd.type === "play") {
        state.transport = "play";
        reaper.play();
      }
      if (cmd.type === "stop") {
        state.transport = "stop";
        reaper.stop();
      }

      if (cmd.type === "mute") {
        const track = state.tracks.find((t) => t.id === cmd.payload) as Track;
        track.mute = !track.mute;
        reaper.toggleMuteTrack(track.id);
      }

      if (cmd.type === "solo") {
        const track = state.tracks.find((t) => t.id === cmd.payload) as Track;
        track.solo = !track.solo;
        reaper.toggleSoloTrack(track.id);
      }

      if (cmd.type === "setLevel") {
        const track = state.tracks.find(
          (t) => t.id === cmd.payload.id,
        ) as Track;
        track.level = cmd.payload.level;
        reaper.setTrackLevel(track.id, track.level);
      }

      if (cmd.type === "getState") {
        reaper.getState().then((newState) => {
          ws.send(JSON.stringify({ type: "state", data: newState }));
        });
      }
    });
  });
}
