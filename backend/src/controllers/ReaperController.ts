import { ReaperControllerInterface } from "../interfaces/ReaperController.interface";
import type { Project, State } from "@reaper/shared";
import { Client, Server } from "node-osc";
import readline from "readline";
import { Readable } from "stream";
import { EventEmitter } from "events";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { getLocalIpAddr } from "../util/get-ip";
import path from "path";
import os from "os";
import fs from "fs";

const execAsync = promisify(exec);
const localIp = getLocalIpAddr();

const sendOscCommand = (command: string, value?: number) => {
  const client = new Client(
    localIp,
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

class ReaperController
  extends EventEmitter
  implements ReaperControllerInterface
{
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
    const playCmd = "/play";
    sendOscCommand(playCmd);
  }

  stop(): void {
    const stopCmd = "/stop";
    sendOscCommand(stopCmd);
  }

  pause(): void {
    const pauseCmd = "/pause";
    sendOscCommand(pauseCmd);
  }

  goToMarker(markerId: number): void {
    const cmd = "/marker";
    sendOscCommand(cmd, markerId);
  }

  saveProject(): void {
    const cmd = "/action/40026";
    sendOscCommand(cmd);
  }

  getOpenProjectInfo(): Promise<Project> {
    const REAPER_PROJECT_INFO_SCRIPT =
      process.env.REAPER_PROJECT_INFO_SCRIPT ?? "";
    const cmd = `/action/${REAPER_PROJECT_INFO_SCRIPT}`;
    sendOscCommand(cmd);
    const TIMEOUT_MS = 10000;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeListener("projectInfoReceived", onProjectInfo);
        reject(new Error("Timeout waiting for project info"));
      }, TIMEOUT_MS);

      const onProjectInfo = (project: Project) => {
        console.log("Project info received in ReaperController:", project);
        clearTimeout(timeoutId);
        resolve(project);
      };

      this.once("projectInfoReceived", onProjectInfo);
    });
  }

  async setAudioDevice(deviceName: string): Promise<boolean> {
    // Implementation to set the audio device
    // X18/XR18
    return true; // Return true if successful, false otherwise
  }

  openProject(path: string) {
    try {
      // Find operating system and construct appropriate command
      const isMac = process.platform === "darwin";
      const executable = isMac ? "open" : "reaper";
      const args = isMac ? ["-a", "REAPER", path] : [path];

      const reaperProcess = spawn(executable, args, {
        detached: true,
        stdio: "ignore",
      });

      reaperProcess.unref();
    } catch (error) {
      console.error("Error opening project:", error);
    }
  }

  openReaper(): boolean {
    try {
      const isMac = process.platform === "darwin";
      const executable = isMac ? "open" : "reaper";
      const args = isMac ? ["-a", "REAPER"] : [];

      const reaperProcess = spawn(executable, args, {
        detached: true,
        stdio: "ignore",
      });

      reaperProcess.unref();
      return true;
    } catch (error) {
      console.error("Error opening REAPER:", error);
      return false;
    }
  }

  async closeReaper(): Promise<boolean> {
    return new Promise((resolve) => {
      execAsync("pkill reaper").then(
        () => {
          console.log("Reaper closed");
          resolve(true);
        },
        (error) => {
          console.error("Error closing Reaper:", error);
          resolve(false);
        },
      );
    });
  }

  async getState(): Promise<State> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 2000);

    try {
      const res = await fetch(
        `http://${localIp}:${process.env.REAPER_WEB_SERVER_PORT}/
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
      const state: State = {
        tracks: [],
        markers: [],
        transport: {
          state: "stop",
          position: 0,
        },
      };
      return state;
    }
  }

  async getTransport(): Promise<State["transport"]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 2000);

    try {
      const res = await fetch(
        `http://${localIp}:${process.env.REAPER_WEB_SERVER_PORT}/_/TRANSPORT;GET;`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const tsv = await res.text();
      const state = await parseReaperState(tsv);
      console.log("Fetched transport from Reaper:", state.transport);
      return state.transport;
    } catch (error) {
      console.error("Error fetching transport from Reaper:", error);
      return {
        state: "stop",
        position: 0,
      };
    }
  }

  configureReaperForX18(): boolean {
    const iniPath = path.join(os.homedir(), ".config", "REAPER", "reaper.ini");
    const configsToUpdate = {
      linux_audio_nch_in: "18",
      linux_audio_nch_out: "18",
      alsa_indev: "hw:X18XR18",
      alsa_outdev: "hw:X18XR18",
    };
    try {
      if (!fs.existsSync(iniPath)) {
        console.error("reaper.ini file not found at expected path:", iniPath);
        return false;
      }
      let content = fs.readFileSync(iniPath, "utf-8");
      Object.entries(configsToUpdate).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(content)) {
          content = content.replace(regex, `${key}=${value}`);
        } else {
          content += `\n${key}=${value}`;
        }
      });
      fs.writeFileSync(iniPath, content, "utf-8");
      console.log(
        "reaper.ini updated successfully for X18/XR18 configuration.",
      );
      return true;
    } catch (error) {
      console.error(
        "Error updating reaper.ini for X18/XR18 configuration:",
        error,
      );
      return false;
    }
  }
}

export default ReaperController;
