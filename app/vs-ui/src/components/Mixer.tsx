import { useState, useEffect } from 'react'
import { useReaper } from '../contexts/ReaperContext';
import type { Track } from '@reaper/shared';
import TrackComponent from './TrackComponent';

const Mixer = () => {
	const [hydrated, setHydrated] = useState(false);

	const { state } = useReaper();

	useEffect(() => {
		// this forces a rerender
		setHydrated(true)
	}, [])

	if (!hydrated) {
		// this returns null on first render, so the client and server match
		return null
	}
	return (
		<div className='flex flex-row gap-x-1 gap-y-4 flex-wrap h-full overflow-y-auto'>
			{state.tracks?.map((track: Track) => (
				<TrackComponent
					key={track.id}
					track={track}
				/>
			))}
		</div>
	)
}

export default Mixer
