import { useEffect, useState } from "react";
import type { State, Command, Project } from "@reaper/shared";

export default function useReaperSocket() {
  const [state, setState] = useState<State | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const OSC_SERVER_IP = import.meta.env.VITE_OSC_SERVER_IP || "localhost";
  const OSC_SERVER_PORT = import.meta.env.VITE_OSC_SERVER_PORT || "3000";

  useEffect(() => {
    const socket = new WebSocket(`ws://${OSC_SERVER_IP}:${OSC_SERVER_PORT}`);

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "state") {
        setState(msg.data);
      }

      if (msg.type === "projects") {
        setProjects(msg.data);
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const send = (cmd: Command) => {
    if (ws) {
      ws.send(JSON.stringify(cmd));
    }
  };

  const getState = () => {
    if (ws) {
      ws.send(JSON.stringify({ type: "getState" }));
    }
  };

  return { state, getState, projects, send };
}
