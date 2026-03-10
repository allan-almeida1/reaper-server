import type { Project } from "@reaper/shared";

export interface ProjectsControllerInterface {
  loadProjects: () => void;
  getProjects: () => Project[];
}
