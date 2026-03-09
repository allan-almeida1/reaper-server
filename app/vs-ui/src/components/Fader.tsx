import { useState, useEffect } from 'react'
import { dbToSlider } from './TrackComponent';

interface FaderProps {
	sliderValue: number;
	onChange: (value: number) => void;
}

const Fader = ({ sliderValue, onChange }: FaderProps) => {
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

	if (!hydrated) {
		// this returns null on first render, so the client and server match
		return null
	}
	return (
		<div className="h-full flex flex-col items-center bg-blue-300">
			<div className='relative h-full bg-red-600'>
				{/* 1. Ticks (Marcações de dB) */}
				<div className="absolute inset-y-0 right-0 w-2 opacity-20 border-y border-gray-400"
					style={{
						backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #fff 20px)',
						backgroundSize: '100% 100%'
					}}
				/>
				{/* 2. Trilho (Slot central) */}
				<div className="absolute w-[4px] h-full bg-black rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1)] border border-[#333]" />

				{/* 3. Input Range (Invisível, mas funcional) */}
				<input
					type="range"
					min="0"
					max="100"
					value={sliderValue}
					onChange={(e) => onChange(parseFloat(e.target.value))}
					onDoubleClick={handleDoubleClick}
					onTouchStart={handleTouchStart}
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
