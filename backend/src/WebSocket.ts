import { WebSocketServer, WebSocket } from "ws";
import { ReaperControllerInterface } from "./interfaces/ReaperController.interface";
import type { State, Track, Project } from "@reaper/shared";
import { ProjectsControllerInterface } from "./interfaces/ProjecrsController.interface";

export function createWsServer(
  wss: WebSocketServer,
  reaper: ReaperControllerInterface,
  projectsController: ProjectsControllerInterface,
) {
  wss.on("connection", async (ws: WebSocket) => {
    const state = await reaper.getState();
    ws.send(JSON.stringify({ type: "state", data: state }));
    ws.send(
      JSON.stringify({
        type: "projects",
        data: {
          projects: projectsController.getProjects(),
          folderPath: process.env.DEFAULT_REAPER_PROJECTS_DIR || "",
        },
      }),
    );
    reaper.getOpenProjectInfo().then((project) => {
      ws.send(JSON.stringify({ type: "currentProject", data: project }));
    });

    ws.on("message", (message: string) => {
      const cmd = JSON.parse(message);

      if (cmd.type === "play") {
        state.transport.state = "play";
        reaper.play();
      }

      if (cmd.type === "stop") {
        state.transport.state = "stop";
        reaper.stop();
      }

      if (cmd.type === "pause") {
        state.transport.state = "pause";
        reaper.pause();
      }

      if (cmd.type === "goToMarker") {
        const markerId = cmd.payload;
        const marker = state.markers.find((m) => m.id === markerId);
        if (!marker) return;
        reaper.goToMarker(marker.id);
      }

      if (cmd.type === "openProject") {
        const projectPath = cmd.payload;
        reaper.openProject(projectPath);
      }

      if (cmd.type === "saveProject") {
        console.log("Saving project...");
        reaper.saveProject();
      }

      if (cmd.type === "getOpenProjectInfo") {
        reaper.getOpenProjectInfo().then((project) => {
          ws.send(JSON.stringify({ type: "currentProject", data: project }));
        });
      }

      if (cmd.type === "readProjects") {
        projectsController.loadProjects();
        const projects = projectsController.getProjects();
        ws.send(
          JSON.stringify({
            type: "projects",
            data: {
              projects,
              folderPath: process.env.DEFAULT_REAPER_PROJECTS_DIR || "",
            },
          }),
        );
      }

      if (cmd.type === "mute") {
        const track = state.tracks.find((t) => t.id === cmd.payload) as Track;
        if (!track) return;
        track.mute = !track.mute;
        reaper.toggleMuteTrack(track.id);
      }

      if (cmd.type === "solo") {
        const track = state.tracks.find((t) => t.id === cmd.payload) as Track;
        if (!track) return;
        track.solo = !track.solo;
        reaper.toggleSoloTrack(track.id);
      }

      if (cmd.type === "setLevel") {
        const track = state.tracks.find(
          (t) => t.id === cmd.payload.id,
        ) as Track;
        if (!track) return;
        track.level = cmd.payload.level;
        reaper.setTrackLevel(track.id, track.level);
      }

      if (cmd.type === "getState") {
        reaper.getState().then((newState) => {
          ws.send(JSON.stringify({ type: "state", data: newState }));
        });
      }

      if (cmd.type === "getTransport") {
        reaper.getTransport().then((newTransport) => {
          ws.send(JSON.stringify({ type: "transport", data: newTransport }));
        });
      }
    });
  });
}
