import express from "express";
import { WebSocketServer } from "ws";
import type { Project } from "@reaper/shared";
import { createWsServer } from "./WebSocket";
import ReaperController from "./controllers/ReaperController";
import dotenv from "dotenv";
import ProjectsController from "./controllers/ProjectsController";
import { getLocalIpAddr } from "./util/get-ip";

dotenv.config();

const app = express();
app.use(express.json());

const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
  const localIp = getLocalIpAddr();
  console.log(`Local IP address: ${localIp}`);
});

const projectsController = new ProjectsController();
const wss = new WebSocketServer({ server });
const reaper = new ReaperController();
createWsServer(wss, reaper, projectsController);

app.post("/api/project_info", (req, res) => {
  const { event, path, name } = req.body;
  if (event === "project_info") {
    console.log(`Received project info: ${name} at ${path}`);
    reaper.emit("projectInfoReceived", { name, path } as Project);
  }
  res.status(200).json({ message: "Project info received" });
});

app.post("/api/reaper/status", (req, res) => {
  res.status(200).json({ message: "Status event received" });
  const { event, message } = req.body;
  console.log(`Status update: ${event} - ${message}`);
});
