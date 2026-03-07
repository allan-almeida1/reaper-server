import { useState, useEffect } from 'react'
import { RiFolderMusicFill } from "react-icons/ri";

const Settings = () => {
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		// this forces a rerender
		setHydrated(true)
	}, [])

	if (!hydrated) {
		// this returns null on first render, so the client and server match
		return null
	}
	return (
		<div className='flex flex-col'>
			<div className='flex items-center gap-4'>
				<button className="btn btn-square btn-primary">
					<RiFolderMusicFill size={26} />
				</button>
				<input type="text" disabled placeholder="Selecionar Pasta" className="input w-full input-primary" />
			</div>
		</div>
	)
}

export default Settings
