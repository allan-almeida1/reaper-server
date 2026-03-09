import { ReaperControllerInterface } from "../interfaces/ReaperController.interface";
import type { State } from "@reaper/shared";
import { Client, Server } from "node-osc";
import readline from "readline";
import { Readable } from "stream";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const sendOscCommand = (command: string, value?: number) => {
  const client = new Client(
    process.env.REAPER_OSC_SERVER_IP!,
    parseInt(process.env.REAPER_OSC_SERVER_PORT!),
  );
  if (value !== undefined) {
    client.send(command, value, (err: Error) => {
      if (err) {
        console.error("Error sending OSC command:", err);
      }
      client.close();
    });
    return;
  }

  client.send(command, (err: Error) => {
    if (err) {
      console.error("Error sending OSC command:", err);
    }
    client.close();
  });
};

const gainToDb = (gain: number): number => {
  return 20 * Math.log10(gain);
};

const FLAGS = {
  NORMAL: 128,
  SELECTED: 2,
  MUTE: 8,
  SOLO: 48,
};

async function parseReaperState(tsv: string): Promise<State> {
  const rl = readline.createInterface({
    input: Readable.from(tsv),
    crlfDelay: Infinity,
  });

  const state: State = {
    tracks: [],
    markers: [],
    transport: {
      state: "stop",
      position: 0,
    },
  };

  rl.on("line", (line) => {
    const columns = line.split("\t");

    if (columns[0] === "TRANSPORT") {
      const transportState = columns[1];
      const position = parseFloat(columns[2]);
      state.transport.position = position;
      if (transportState === "0") {
        state.transport.state = "stop";
      } else if (transportState === "1") {
        state.transport.state = "play";
      } else if (transportState === "2") {
        state.transport.state = "pause";
      }
    } else if (columns[0] === "TRACK" && columns[1] !== "0") {
      const trackId = parseInt(columns[1]);
      const trackName = columns[2];
      const trackState = parseInt(columns[3]);
      const trackLevel = parseFloat(columns[4]);
      const mute = (trackState & FLAGS.MUTE) !== 0;
      const solo = (trackState & FLAGS.SOLO) !== 0;
      state.tracks.push({
        id: trackId,
        name: trackName,
        mute,
        solo,
        level: gainToDb(trackLevel),
      });
    } else if (columns[0] === "MARKER") {
      const markerId = parseInt(columns[2]);
      const markerName = columns[1];
      const position = parseFloat(columns[3]);
      state.markers.push({
        id: markerId,
        name: markerName,
        position,
      });
    }
  });

  await new Promise((resolve) => rl.on("close", resolve));

  return state;
}

class ReaperController implements ReaperControllerInterface {
  toggleMuteTrack(trackId: number): void {
    const cmd = `/track/${trackId}/mute/toggle`;
    sendOscCommand(cmd);
  }

  toggleSoloTrack(trackId: number): void {
    const cmd = `/track/${trackId}/solo/toggle`;
    sendOscCommand(cmd);
  }

  setTrackLevel(trackId: number, level: number): void {
    const cmd = `/track/${trackId}/volume`;
    sendOscCommand(cmd, level);
  }

  play(): void {
    const playCmd = "/action/1007";
    sendOscCommand(playCmd);
  }

  stop(): void {
    const stopCmd = "/action/1016";
    sendOscCommand(stopCmd);
  }

  pause(): void {
    const pauseCmd = "/action/1008";
    sendOscCommand(pauseCmd);
  }

  goToMarker(markerId: number): void {
    const cmd = "/marker";
    sendOscCommand(cmd, markerId);
  }

  async setAudioDevice(deviceName: string): Promise<boolean> {
    // Implementation to set the audio device
    // X18/XR18
    return true; // Return true if successful, false otherwise
  }

  async openProject(path: string): Promise<boolean> {
    try {
      const cmd = `xdg-open "${path}"`;
      await execAsync(cmd);
      return true;
    } catch (error) {
      console.error("Error opening project:", error);
      return false;
    }
  }

  async getState(): Promise<State> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 2000);

    try {
      const res = await fetch(
        `http://${process.env.REAPER_WEB_SERVER_IP}:${process.env.REAPER_WEB_SERVER_PORT}/
		_/TRANSPORT;TRACK;GET;MARKER;GET;`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const tsv = await res.text();
      const state = await parseReaperState(tsv);
      console.log("Fetched state from Reaper:", state);
      return state;
    } catch (error) {
      console.error("Error fetching state from Reaper:", error);
      return {} as State;
    }
  }
}

export default ReaperController;
