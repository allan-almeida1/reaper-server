import express from "express";
import { WebSocketServer } from "ws";
import type { Project } from "@reaper/shared";
import { createWsServer } from "./WebSocket";
import ReaperController from "./controllers/ReaperController";
import dotenv from "dotenv";
import { updateCurrentProject } from "./project";

dotenv.config();

const app = express();
app.use(express.json());

const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

let projects: Project[] = [
  {
    name: "01 - OUTRA VIDA ZOIO TEU ANDEI SO ZOIO DE LULA",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "01 - RAIZ DE TODO BEM TOPO DO MUNDO ENVOLVIDAO",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - O QUE MEUS OLHOS VIRAM",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - O QUE MEUS OLHOS VIRAM",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - O QUE MEUS OLHOS VIRAM",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - O QUE MEUS OLHOS VIRAM",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - O QUE MEUS OLHOS VIRAM",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - O QUE MEUS OLHOS VIRAM",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "03 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
  {
    name: "03 - O QUE MEUS OLHOS VIRAM",
    path: "/home/allan/Documents/REAPER Media/sample_project.RPP",
  },
];

const wss = new WebSocketServer({ server });
const reaper = new ReaperController();
createWsServer(wss, reaper, projects);

app.post("/api/project/open", (req, res) => {
  res.status(200).json({ message: "Project open event received" });
  const { event, path } = req.body;
  if (event === "project_opened") {
    console.log("Project opened:", path);
    reaper.getState().then((state) => {
      const currentProjectName =
        projects.find((p) => p.path === path)?.name || "Unknown Project";
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
