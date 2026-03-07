import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import type { State, Track, Project } from "@reaper/shared";

const app = express();
const server = app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});

const wss = new WebSocketServer({ server });

let state: State = {
  transport: "stop",
  tracks: [
    { id: 1, name: "CLICK", mute: false, solo: false, level: -12.0 },
    { id: 2, name: "KICK", mute: false, solo: false, level: -12.0 },
    { id: 3, name: "SNARE", mute: false, solo: false, level: -12.0 },
    { id: 4, name: "HAT", mute: false, solo: false, level: -12.0 },
    { id: 5, name: "BASS", mute: false, solo: false, level: -12.0 },
    { id: 6, name: "GUITAR", mute: false, solo: false, level: -12.0 },
    { id: 7, name: "VOCALS", mute: false, solo: false, level: -12.0 },
    { id: 8, name: "PADS", mute: false, solo: false, level: -12.0 },
    { id: 9, name: "LEAD", mute: false, solo: false, level: -12.0 },
    { id: 10, name: "FX", mute: false, solo: false, level: -12.0 },
    { id: 11, name: "BACKING VOCALS", mute: false, solo: false, level: -12.0 },
    { id: 12, name: "STRINGS", mute: false, solo: false, level: -12.0 },
  ],
  markers: [
    { id: 1, name: "Intro" },
    { id: 2, name: "Verse" },
    { id: 3, name: "Chorus" },
  ],
};

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

wss.on("connection", (ws: WebSocket) => {
  ws.send(JSON.stringify({ type: "state", data: state }));
  ws.send(JSON.stringify({ type: "projects", data: projects }));

  ws.on("message", (message: string) => {
    const cmd = JSON.parse(message);

    if (cmd.type === "play") {
      state.transport = "play";
    }
    if (cmd.type === "stop") {
      state.transport = "stop";
    }

    if (cmd.type === "mute") {
      const track = state.tracks.find((t) => t.id === cmd.payload) as Track;
      track.mute = !track.mute;
    }

    if (cmd.type === "solo") {
      const track = state.tracks.find((t) => t.id === cmd.payload) as Track;
      track.solo = !track.solo;
    }

    if (cmd.type === "setLevel") {
      const track = state.tracks.find((t) => t.id === cmd.payload.id) as Track;
      track.level = cmd.payload.level;
    }

    broadcast();
  });
});

function broadcast() {
  const msg = JSON.stringify({ type: "state", data: state });
  console.log(state);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
