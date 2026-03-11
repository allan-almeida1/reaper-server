import type { Command, Project, State } from '@reaper/shared'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ReaperContextType {
	state: State;
	projects: Project[];
	send: (cmd: Command) => void;
	getState: () => void;
	isOpeningProject: boolean;
	setIsOpeningProject: (isOpening: boolean) => void;
	projectsPath: string;
	currentProjectInfo?: Project | null;
}

const ReaperContext = createContext<ReaperContextType>({
	state: { tracks: [], transport: { state: "stop", position: 0 }, markers: [] },
	projects: [],
	send: () => { },
	getState: () => { },
	isOpeningProject: false,
	setIsOpeningProject: () => { },
	projectsPath: "",
	currentProjectInfo: null,
});

export function ReaperProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<State>({ tracks: [], transport: { state: "stop", position: 0 }, markers: [] });
	const [projects, setProjects] = useState<Project[]>([]);
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [isOpeningProject, setIsOpeningProject] = useState(false);
	const [projectsPath, setProjectsPath] = useState("");
	const [currentProjectInfo, setCurrentProjectInfo] = useState<Project | null>(null);

	const OSC_SERVER_IP = import.meta.env.VITE_OSC_SERVER_IP || "localhost";
	const OSC_SERVER_PORT = import.meta.env.VITE_OSC_SERVER_PORT || "3000";

	useEffect(() => {
		const socket = new WebSocket(`ws://${OSC_SERVER_IP}:${OSC_SERVER_PORT}`);

		socket.onmessage = (event) => {
			const msg = JSON.parse(event.data);

			if (msg.type === "state") {
				console.log("Received state update:", msg.data);
				setState({ ...msg.data });
			}

			if (msg.type === "projects") {
				setProjects(msg.data.projects);
				setProjectsPath(msg.data.folderPath);
			}

			if (msg.type === "currentProject") {
				setCurrentProjectInfo(msg.data);
			}
		};

		setWs(socket);

		return () => {
			socket.close();
		};
	}, [OSC_SERVER_IP, OSC_SERVER_PORT]);

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

	return (
		<ReaperContext.Provider value={{
			state,
			getState,
			projects,
			send,
			isOpeningProject,
			setIsOpeningProject,
			projectsPath,
			currentProjectInfo,
		}}>
			{children}
		</ReaperContext.Provider>
	)
}

export const useReaper = () => {
	const context = useContext(ReaperContext);
	if (!context) throw new Error("useReaper must be used within ReaperProvider");
	return context;
};
