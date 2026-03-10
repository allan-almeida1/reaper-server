import express from "express";
import { WebSocketServer } from "ws";
import type { Project } from "@reaper/shared";
import { createWsServer } from "./WebSocket";
import ReaperController from "./controllers/ReaperController";
import dotenv from "dotenv";
import { updateCurrentProject } from "./project";
import ProjectsController from "./controllers/ProjectsController";

dotenv.config();

const app = express();
app.use(express.json());

const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const projectsController = new ProjectsController();
const wss = new WebSocketServer({ server });
const reaper = new ReaperController();
createWsServer(wss, reaper, projectsController);

app.post("/api/project/open", (req, res) => {
  res.status(200).json({ message: "Project open event received" });
  const { event, path } = req.body;
  if (event === "project_opened") {
    console.log("Project opened:", path);
    reaper.getState().then((state) => {
      const currentProjectName =
        projectsController.getProjects().find((p) => p.path === path)?.name ||
        "Unknown Project";
      updateCurrentProject(currentProjectName);
      state.currentProject = {
        name: currentProjectName,
        path,
      };
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "state", data: state }));
        }
      });
    });
  }
});

app.post("/api/reaper/status", (req, res) => {
  res.status(200).json({ message: "Status event received" });
  const { event, message } = req.body;
  console.log(`Status update: ${event} - ${message}`);
});
