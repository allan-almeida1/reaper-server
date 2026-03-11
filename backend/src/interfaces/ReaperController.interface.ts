import type { Project, State } from "@reaper/shared";

export interface ReaperControllerInterface {
  toggleMuteTrack(trackId: number): void;
  toggleSoloTrack(trackId: number): void;
  setTrackLevel(trackId: number, level: number): void;
  play(): void;
  stop(): void;
  pause(): void;
  goToMarker(markerId: number): void;
  setAudioDevice(deviceName: string): Promise<boolean>;
  getState(): Promise<State>;
  openProject(path: string): void;
  saveProject(): void;
  getOpenProjectInfo(): Promise<Project>;
}
