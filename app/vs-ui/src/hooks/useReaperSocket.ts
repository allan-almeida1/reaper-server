import { useEffect, useState } from "react";
import type { State, Command, Project } from "@reaper/shared";

export default function useReaperSocket() {
  const [state, setState] = useState<State | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.0.9:3000");

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

  return { state, projects, send };
}
