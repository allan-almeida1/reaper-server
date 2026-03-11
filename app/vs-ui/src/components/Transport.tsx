import { useState, useEffect, useRef } from 'react'
import { FaPlay, FaStop } from "react-icons/fa";
import { FaPause } from "react-icons/fa6";
import { VscTriangleDown } from "react-icons/vsc";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";
import type { Marker } from "@reaper/shared";
import { useReaper } from '../contexts/ReaperContext';


const Transport = () => {
	const [hydrated, setHydrated] = useState(false);
	const [activeMarker, setActiveMarker] = useState<number>(1);
	const [clickedMarker, setClickedMarker] = useState<number>(0);
	const [isMarkerClicked, setIsMarkerClicked] = useState(false);
	const [showingMarkers, setShowingMarkers] = useState(false);

	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const {
		state,
		getState,
		send,
		isOpeningProject,
		setIsOpeningProject,
		currentProjectInfo,
		getTransport
	} = useReaper();

	useEffect(() => {
		// this forces a rerender
		setHydrated(true)
	}, [])

	const delayedGetState = () => {
		setTimeout(() => {
			getState();
		}, 100);
	}

	const goToMarker = async (marker: Marker) => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setIsMarkerClicked(true);
		setClickedMarker(marker.id);

		timeoutRef.current = setTimeout(() => {
			setIsMarkerClicked(false);
			setClickedMarker(0);
		}, 8000);

		await send({ type: "goToMarker", payload: marker.id });
		console.log("Sent goToMarker command for marker ID:", marker.id);
		getTransport();
	}

	useEffect(() => {
		if (isMarkerClicked && state.markers.length > 0) {
			const marker = state.markers.find((m) => m.id === clickedMarker);
			if (!marker) return;

			const currentPosition = state.transport.position;
			const diff = Math.abs(currentPosition - marker.position);

			if (diff < 0.5) {
				setActiveMarker(marker.id);
				setIsMarkerClicked(false);
				setClickedMarker(0);
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = null;
				}
			} else {
				const pollTimer = setTimeout(() => {
					getTransport();
				}, 200);
				return () => clearTimeout(pollTimer);
			}
		}
	}, [state.transport.position, isMarkerClicked, clickedMarker])

	useEffect(() => {
		setIsOpeningProject(false);
	}, [currentProjectInfo?.name])

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

			<div className={`flex flex-col ${showingMarkers ? "hidden" : ""} sm:flex`}>
				<span className='text-sm opacity-50'>{currentProjectInfo?.name}</span>
				<div className='flex items-center gap-6'>
					<button className={`cursor-pointer block p-4 active:scale-90 transition-transform  
					${state?.transport?.state === "play" ? "text-accent" : ""}`}
						onClick={() => {
							send({ type: "play" });
							delayedGetState();
						}}>
						<FaPlay size={36} />
					</button>
					<button className={`cursor-pointer block p-4 active:scale-90 transition-transform  
					${state?.transport?.state === "pause" ? "text-accent" : ""}`}
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

			{!isOpeningProject && (
				<div className={`w-full justify-evenly ${!showingMarkers ? "hidden" : "flex"} sm:flex`}>
					{state.markers?.map((marker: Marker) => (
						<div key={marker.id} className='flex flex-col items-center cursor-pointer gap-2'
							onClick={() => goToMarker(marker)}>
							<div className={`${activeMarker === marker.id ? "text-accent" : "opacity-0"} ${isMarkerClicked && clickedMarker === marker.id ? "hidden" : "flex"}`}>
								<VscTriangleDown size={24} />
							</div>
							<div className={`${clickedMarker === marker.id && activeMarker !== marker.id ? "flex" : "hidden"} text-base-content opacity-50`}>
								<VscTriangleDown size={24} />
							</div>
							<div className='w-8 aspect-square text-lg flex items-center justify-center active:scale-90 transition-transform  rounded-full bg-secondary'>{marker.id}</div>
							<span className='text-[0.6rem]'>{marker.name}</span>
						</div>
					))}
				</div>
			)}

			{isOpeningProject && (
				<div className='w-full flex gap-3 justify-center flex-col items-center text-base-content opacity-50'>
					<span className="loading loading-spinner loading-xl"></span>
					<div className="">Carregando projeto... </div>
				</div>
			)}

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
