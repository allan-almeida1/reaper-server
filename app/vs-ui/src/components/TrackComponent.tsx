
import type { Track, Command } from "@reaper/shared";
import { useState, type ChangeEvent } from "react";

interface TrackComponentProps {
	track: Track;
	send: (cmd: Command) => void;
}

const sliderToDb = (sliderValue: number): number => {
	if (sliderValue === 0) {
		return -133;
	}

	const minDb = -133;
	const maxDb = 12;
	return minDb + (sliderValue / 100) * (maxDb - minDb);
};

const dbToSlider = (dbValue: number): number => {
	if (dbValue <= -133) {
		return 0;
	}
	const minDb = -133;
	const maxDb = 12;
	return ((dbValue - minDb) / (maxDb - minDb)) * 100;
}

export default function TrackComponent({ track, send }: TrackComponentProps) {

	const [level, setLevel] = useState(track.level);

	const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
		const sliderValue = parseInt(event.target.value);
		const dbValue = sliderToDb(sliderValue);
		setLevel(dbValue);

		send({
			type: "setLevel",
			payload: {
				id: track.id,
				level: dbValue
			}
		})
	}

	return (
		<li className="list-row ">
			<div className="gap-2 flex items-center">
				<h3 className="text-sm font-medium shrink-0 rounded-full bg-base-300 flex items-center justify-center aspect-square w-8">{track.id}</h3>
				<button
					className={`${track.mute ? 'bg-red-500' : 'bg-[#462627] text-[#FF6467]'} rounded-sm px-4 py-2 cursor-pointer`}
					onClick={() => {
						send({
							type: "mute",
							payload: track.id
						})
					}}
				>M</button>

				<button
					className={`${track.solo ? 'bg-yellow-500' : 'bg-[#464226] text-yellow-200'} rounded-sm px-4 py-2 text-white cursor-pointer`}
					onClick={() => {
						send({
							type: "solo",
							payload: track.id
						})
					}}
				>S</button>
			</div>

			<div className="flex items-center">
				<b>{track.name}</b>
			</div>


			<div className="min-w-56 flex items-center gap-3">
				<div className="w-12 text-sm font-medium shrink-0">{track.level < 0 ? track.level.toFixed(1) : `+${track.level.toFixed(1)}`}</div>
				<input
					type="range"
					min={0}
					max="100"
					value={dbToSlider(level)}
					onChange={handleSliderChange}
					className="range [--range-fill:0] range-accent"
				/>
			</div>

		</li>
	)
}
