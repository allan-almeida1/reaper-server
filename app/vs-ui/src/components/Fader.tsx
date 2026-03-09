import { useState, useEffect } from 'react'
import { dbToNormalized, dbToSlider } from './TrackComponent';

interface FaderProps {
	sliderValue: number;
	onChange: (value: number) => void;
	getState?: () => void;
}

const Fader = ({ sliderValue, onChange, getState }: FaderProps) => {
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		// this forces a rerender
		setHydrated(true)
	}, [])

	const [lastTap, setLastTap] = useState(0);

	const handleTouchStart = () => {
		const now = Date.now();
		if (lastTap && (now - lastTap) < 250) {
			onChange(dbToSlider(0.4)); // Define o valor do slider para 0 dB (corrigindo aprox)
		} else {
			setLastTap(now);
		}
	}

	const handleDoubleClick = () => {
		onChange(dbToSlider(0.4)); // Define o valor do slider para 0 dB (corrigindo aprox)
	}

	const DB_TICKS = [12, 6, 0, -6, -12, -18, -24, -30, -60, -Infinity];

	if (!hydrated) {
		// this returns null on first render, so the client and server match
		return null
	}
	return (
		<div className="h-full flex flex-col items-center bg-blue-300">
			<div className='relative h-full bg-red-600'>
				{/* 1. Ticks (Marcações de dB) */}
				<div className="absolute inset-y-0 right-0 w-3 pointer-events-none">
					{DB_TICKS.map((db) => {
						// Converte o valor de dB para a posição vertical (0 a 100%)
						// Como o fader é vertical, o topo é 100% (max dB) e a base é 0%
						const position = (1 - dbToNormalized(db)) * 100;

						return (
							<div
								key={db}
								className="absolute right-0 flex items-center w-full"
								style={{ top: `${position}%` }}
							>
								{/* A linha da marcação */}
								<div className={`h-[1px] w-full ${db === 0 ? 'bg-white opacity-80 w-4' : 'bg-gray-400 opacity-30'}`} />

								{/* O texto do dB (opcional, só para os principais) */}
								{[12, 0, -12, -24, -60].includes(db) && (
									<span className="absolute -right-6 text-[10px] text-gray-500 font-mono">
										{db <= 0 ? db : `+${db}`}
									</span>
								)}
							</div>
						);
					})}
				</div>
				{/* 2. Trilho (Slot central) */}
				<div className="absolute w-[4px] h-full bg-black shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1)] border border-[#444]" />

				{/* 3. Input Range (Invisível, mas funcional) */}
				<input
					type="range"
					min="0"
					max="100"
					value={sliderValue}
					onChange={(e) => onChange(parseFloat(e.target.value))}
					onDoubleClick={handleDoubleClick}
					onTouchStart={handleTouchStart}
					onMouseUp={getState ? () => setTimeout(getState, 100) : undefined}
					className="fader-input absolute w-64 h-12 -left-31.5 top-24 appearance-none cursor-pointer z-10"
					style={{ transform: 'rotate(-90deg)' }}
				/>

				<style dangerouslySetInnerHTML={{
					__html: `
          .fader-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 38px;
            border-radius: 3px;
            /* Efeito Metal Escovado */
            background: linear-gradient(to right, #cfd3d6 0%, #9ca3af 45%, #4b5563 50%, #6b7280 55%, #d1d5db 100%);
            border: 1px solid #000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.5);
            cursor: ns-resize;
          }
          .fader-input::-moz-range-thumb {
            height: 20px;
            width: 38px;
            background: #9ca3af;
            border: 1px solid #000;
            border-radius: 3px;
          }
        `}} />
			</div>
		</div >
	)
}

export default Fader
