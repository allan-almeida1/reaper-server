import { useState, useEffect } from 'react'
import { FaPlay, FaStop } from "react-icons/fa";
import { FaPause } from "react-icons/fa6";
import type { Command, State } from "@reaper/shared";

interface TransportProps {
	send: (cmd: Command) => void;
	getState?: () => void;
	state: State;
}

const Transport = ({ getState, send, state }: TransportProps) => {
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		// this forces a rerender
		setHydrated(true)
	}, [])

	const delayedGetState = () => {
		setTimeout(() => {
			if (getState) {
				getState();
			}
		}, 100);
	}


	if (!hydrated) {
		// this returns null on first render, so the client and server match
		return null
	}
	return (
		<div className='flex justify-between items-center'>
			<div className='flex items-center gap-6'>

				<button className={`cursor-pointer block p-4 active:scale-90 transition-transform  
					${state.transport === "play" ? "text-accent" : ""}`}
					onClick={() => {
						send({ type: "play" });
						delayedGetState();
					}}>
					<FaPlay size={36} />
				</button>
				<button className={`cursor-pointer block p-4 active:scale-90 transition-transform  
					${state.transport === "pause" ? "text-accent" : ""}`}
					onClick={() => {
						send({ type: "pause" });
						delayedGetState();
					}}>
					<FaPause size={36} />
				</button>

				<button className={`cursor-pointer block p-4 active:scale-90 transition-transform`}
					onClick={() => {
						send({ type: "stop" });
						delayedGetState();
					}}>
					<FaStop size={36} />
				</button>
			</div>
		</div>
	)
}

export default Transport
