import { useState, useEffect } from 'react'
import { FaPlay, FaStop } from "react-icons/fa";
import { FaPause } from "react-icons/fa6";
import { VscTriangleDown } from "react-icons/vsc";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";
import type { Command, Marker, State } from "@reaper/shared";

interface TransportProps {
	send: (cmd: Command) => void;
	getState?: () => void;
	state: State;
}

const Transport = ({ getState, send, state }: TransportProps) => {
	const [hydrated, setHydrated] = useState(false);
	const [activeMarker, setActiveMarker] = useState<number>(1);
	const [clickedMarker, setClickedMarker] = useState<number | null>(null);
	const [isMarkerClicked, setIsMarkerClicked] = useState(false);
	const [showingMarkers, setShowingMarkers] = useState(false);

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

	const goToMarker = async (marker: Marker) => {
		if (!getState) return false;
		setIsMarkerClicked(true);
		setClickedMarker(marker.id);
		await send({ type: "goToMarker", payload: marker.id });
		delayedGetState();
	}

	useEffect(() => {
		if (isMarkerClicked) {
			console.log("Marker clicked, checking position...", activeMarker);
			setIsMarkerClicked(false);
			const currentPosition = state.transport.position;
			const marker = state.markers.find((m) => m.id === clickedMarker)
			if (Math.abs(currentPosition - marker!.position) < 0.5) {
				setActiveMarker(marker!.id);
			}
		}
	}, [state])

	if (!hydrated) {
		// this returns null on first render, so the client and server match
		return null
	}
	return (
		<div className='flex justify-evenly items-center'>
			{showingMarkers && (
				<div className='flex sm:hidden justify-start flex-1'>
					<button className='btn cursor-pointer btn-primary btn-circle btn-sm'
						onClick={() => setShowingMarkers(!showingMarkers)}>
						<RiArrowLeftSLine size={36} />
					</button>
				</div>
			)}

			<div className={`flex items-center gap-6 ${showingMarkers ? "hidden" : ""} sm:flex`}>

				<button className={`cursor-pointer block p-4 active:scale-90 transition-transform  
					${state.transport.state === "play" ? "text-accent" : ""}`}
					onClick={() => {
						send({ type: "play" });
						delayedGetState();
					}}>
					<FaPlay size={36} />
				</button>
				<button className={`cursor-pointer block p-4 active:scale-90 transition-transform  
					${state.transport.state === "pause" ? "text-accent" : ""}`}
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

			<div className={`w-full justify-evenly ${!showingMarkers ? "hidden" : "flex"} sm:flex`}>
				{state.markers.map((marker: Marker) => (
					<div key={marker.id} className='flex flex-col items-center cursor-pointer gap-2'
						onClick={() => goToMarker(marker)}>
						<div className={activeMarker === marker.id ? "text-accent" : "opacity-0"}>
							<VscTriangleDown size={24} />
						</div>
						<div className='w-8 aspect-square text-lg flex items-center justify-center active:scale-90 transition-transform  rounded-full bg-secondary'>{marker.id}</div>
						<span className='text-[0.6rem]'>{marker.name}</span>
					</div>
				))}
			</div>

			{!showingMarkers && (
				<div className='flex sm:hidden justify-end w-full'>
					<button className='btn cursor-pointer btn-primary btn-circle btn-sm'
						onClick={() => setShowingMarkers(!showingMarkers)}>
						<RiArrowRightSLine size={36} />
					</button>
				</div>
			)}
		</div>
	)
}


export default Transport
