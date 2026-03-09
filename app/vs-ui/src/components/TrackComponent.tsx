
import type { Track, Command } from "@reaper/shared";
import { useCallback, useEffect, useState } from "react";
import { set, throttle } from "lodash";
import Fader from "./Fader";

interface TrackComponentProps {
	track: Track;
	send: (cmd: Command) => void;
	getState?: () => void;
	key?: React.Key;
}

const REAPER_MIN_DB = -Infinity;
const REAPER_MAX_DB = 12;

/**
 * Converte o valor do Slider (0-100) para dB usando curva do Reaper
 */
const sliderToDb = (sliderValue: number): number => {
	const normalized = sliderValue / 100;
	return normalizedToDb(normalized);
};

/**
 * Converte dB para Slider (0-100)
 */
const dbToSlider = (dbValue: number): number => {
	return dbToNormalized(dbValue) * 100;
};

/**
 * Converte 0.0-1.0 (OSC) para dB
 * O Reaper usa: val = (db_val_normalized ^ 4) * max_gain_val
 * Para simplificar e manter a precisão de -133 a +12:
 */
const normalizedToDb = (val: number): number => {
	if (val <= 0) return REAPER_MIN_DB;

	// O Reaper usa uma escala onde 1.0 é +12dB e ~0.716 é 0dB
	// A fórmula comum de mapeamento do Reaper para faders é:
	// db = 20 * log10(val^k) -> mas para o fader web, usamos interpolação exponencial

	const db = 20 * Math.log10(Math.pow(val, 4)) + REAPER_MAX_DB;
	return Math.max(REAPER_MIN_DB, db);
};

/**
 * Converte dB para 0.0-1.0 (OSC)
 */
const dbToNormalized = (db: number): number => {
	if (db <= REAPER_MIN_DB) return 0;

	// Inversa da função acima
	// normalized = 10^((db - 12) / (20 * 4))
	const val = Math.pow(10, (db - REAPER_MAX_DB) / 80);
	return Math.min(1, val);
};

export default function TrackComponent({ track, send, getState, key }: TrackComponentProps) {

	const [level, setLevel] = useState(track.level);

	const delayedGetState = () => {
		setTimeout(() => {
			if (getState) {
				getState();
			}
		}, 100);
	}

	const throttledSetLevel = useCallback(
		throttle((level: number) => {
			send({
				type: "setLevel",
				payload: {
					id: track.id,
					level
				}
			});
			if (getState) {
				getState();
			}
			console.log(track.level);
		}, 50, { leading: true, trailing: true }),
		[]
	);

	const handleSliderChange = (sliderValue: number) => {
		const dbValue = sliderToDb(sliderValue);
		setLevel(dbValue);
		throttledSetLevel(sliderValue / 100);
	}

	return (
		<div key={key} className="h-96 bg-base-200 flex flex-col w-14">
			<div className="gap-2 flex flex-col items-center h-full p-1">
				<button
					className={`${track.solo ? 'bg-yellow-500' : 'bg-[#464226] text-yellow-200'} rounded-sm px-4 py-1 text-white cursor-pointer`}
					onClick={() => {
						send({
							type: "solo",
							payload: track.id
						});
						if (getState) {
							delayedGetState();
						}
					}}
				>S</button>
				<div className="">
					{
						typeof track.level === "number" && isFinite(track.level) ? (track.level < 0 ? track.level.toFixed(1) : `+${track.level.toFixed(1)}`) : "-inf"
					}
				</div>
				<Fader
					sliderValue={dbToSlider(level)}
					onChange={handleSliderChange}
				/>
				<button
					className={`${track.mute ? 'bg-red-500' : 'bg-[#462627] text-[#FF6467]'} rounded-sm px-4 py-1 cursor-pointer`}
					onClick={() => {
						send({
							type: "mute",
							payload: track.id
						});
						delayedGetState();
					}}
				>M</button>
			</div>

			<div className="flex bg-[#376FAB] font-light items-center justify-center p-1 text-xs">
				<b>{track.name === "" ? "--" : track.name}</b>
			</div>
		</div>
	)
}

export { dbToSlider };
