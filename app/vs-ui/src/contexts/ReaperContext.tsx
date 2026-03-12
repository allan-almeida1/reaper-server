import type { Command, Project, State } from '@reaper/shared'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface ReaperContextType {
	state: State;
	projects: Project[];
	send: (cmd: Command) => void;
	getState: () => void;
	isOpeningProject: boolean;
	setIsOpeningProject: (isOpening: boolean) => void;
	projectsPath: string;
	currentProjectInfo?: Project | null;
	getTransport: () => void;
	onConfigureReaperDeviceResult: (callback: (success: boolean) => void) => () => void;
	onOpenReaperResult: (callback: (success: boolean) => void) => () => void;
	onCloseReaperResult: (callback: (success: boolean) => void) => () => void;
	onProjectsLoaded: (callback: (projects_count: number) => void) => () => void;
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
	getTransport: () => { },
	onConfigureReaperDeviceResult: () => () => { },
	onOpenReaperResult: () => () => { },
	onCloseReaperResult: () => () => { },
	onProjectsLoaded: () => () => { },
});

const reaperEvents = new EventTarget();

export function ReaperProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<State>({ tracks: [], transport: { state: "stop", position: 0 }, markers: [] });
	const [projects, setProjects] = useState<Project[]>([]);
	const [ws, setWs] = useState<WebSocket | null>(null);
	const [isOpeningProject, setIsOpeningProject] = useState(false);
	const [projectsPath, setProjectsPath] = useState("");
	const [currentProjectInfo, setCurrentProjectInfo] = useState<Project | null>(null);

	const OSC_SERVER_IP = typeof window !== "undefined" ? window.location.hostname : "localhost";
	const OSC_SERVER_PORT = import.meta.env.VITE_OSC_SERVER_PORT || "3000";

	const onConfigureReaperDeviceResult = useCallback((callback: (success: boolean) => void) => {
		const handler = (event: Event) => callback((event as CustomEvent).detail.success);
		reaperEvents.addEventListener("configureReaperForX18Result", handler);
		return () => {
			reaperEvents.removeEventListener("configureReaperForX18Result", handler);
		};
	}, []);

	const onOpenReaperResult = useCallback((callback: (success: boolean) => void) => {
		const handler = (event: Event) => callback((event as CustomEvent).detail.success);
		reaperEvents.addEventListener("openReaperResult", handler);
		return () => {
			reaperEvents.removeEventListener("openReaperResult", handler);
		};
	}, []);

	const onCloseReaperResult = useCallback((callback: (success: boolean) => void) => {
		const handler = (event: Event) => callback((event as CustomEvent).detail.success);
		reaperEvents.addEventListener("closeReaperResult", handler);
		return () => {
			reaperEvents.removeEventListener("closeReaperResult", handler);
		};
	}, []);

	const onProjectsLoaded = useCallback((callback: (projects_count: number) => void) => {
		const handler = (event: Event) => callback((event as CustomEvent).detail.projects_count);
		reaperEvents.addEventListener("projectsLoaded", handler);
		return () => {
			reaperEvents.removeEventListener("projectsLoaded", handler);
		};
	}, []);

	useEffect(() => {
		const socket = new WebSocket(`ws://${OSC_SERVER_IP}:${OSC_SERVER_PORT}`);

		socket.onmessage = (event) => {
			const msg = JSON.parse(event.data);

			if (msg.type === "state") {
				console.log("Received state update:", msg.data);
				setState({ ...msg.data });
			}

			if (msg.type === "transport") {
				setState((prevState) => ({
					...prevState,
					transport: msg.data,
				}));
			}

			if (msg.type === "projects") {
				setProjects(msg.data.projects);
				setProjectsPath(msg.data.folderPath);
				const event = new CustomEvent("projectsLoaded", { detail: { projects_count: msg.data.projects.length } });
				reaperEvents.dispatchEvent(event);
			}

			if (msg.type === "currentProject") {
				setCurrentProjectInfo(msg.data);
			}

			if (msg.type === "configureReaperForX18Result") {
				const event = new CustomEvent("configureReaperForX18Result", { detail: { success: msg.data.success } });
				reaperEvents.dispatchEvent(event);
			}

			if (msg.type === "openReaperResult") {
				const event = new CustomEvent("openReaperResult", { detail: { success: msg.data.success } });
				reaperEvents.dispatchEvent(event);
			}

			if (msg.type === "closeReaperResult") {
				const event = new CustomEvent("closeReaperResult", { detail: { success: msg.data.success } });
				reaperEvents.dispatchEvent(event);
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

	const getTransport = () => {
		if (ws) {
			ws.send(JSON.stringify({ type: "getTransport" }));
			console.log("Sent getTransport command");
		}
	}

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
			getTransport,
			onConfigureReaperDeviceResult,
			onOpenReaperResult,
			onCloseReaperResult,
			onProjectsLoaded
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
