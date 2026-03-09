import express from "express";
import { WebSocketServer } from "ws";
import type { Project } from "@reaper/shared";
import { createWsServer } from "./WebSocket";
import ReaperController from "./controllers/ReaperController";
import { Server } from "node-osc";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

let projects: Project[] = [
  {
    name: "01 - OUTRA VIDA ZOIO TEU ANDEI SO ZOIO DE LULA",
    path: "/path/to/project1",
  },
  {
    name: "01 - RAIZ DE TODO BEM TOPO DO MUNDO ENVOLVIDAO",
    path: "/path/to/project2",
  },
  { name: "02 - O QUE MEUS OLHOS VIRAM", path: "/path/to/project2" },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/path/to/project3",
  },
  { name: "02 - O QUE MEUS OLHOS VIRAM", path: "/path/to/project2" },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/path/to/project3",
  },
  { name: "02 - O QUE MEUS OLHOS VIRAM", path: "/path/to/project2" },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/path/to/project3",
  },
  { name: "02 - O QUE MEUS OLHOS VIRAM", path: "/path/to/project2" },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/path/to/project3",
  },
  { name: "02 - O QUE MEUS OLHOS VIRAM", path: "/path/to/project2" },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/path/to/project3",
  },
  { name: "02 - O QUE MEUS OLHOS VIRAM", path: "/path/to/project2" },
  {
    name: "02 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/path/to/project3",
  },
  {
    name: "03 - A VIDA É DO TAMANHO DO QUE A GENTE QUER",
    path: "/path/to/project3",
  },
  { name: "03 - O QUE MEUS OLHOS VIRAM", path: "/path/to/project4" },
];

const wss = new WebSocketServer({ server });
const reaper = new ReaperController();
createWsServer(wss, reaper, projects);

const oscServer = new Server(3333, "0.0.0.0", () => {
  console.log("OSC Server is listening on port 3333");
});

oscServer.on("message", (msg) => {
  console.log("Message:", msg);
});
