import { useState, useEffect } from 'react'
import { RiFolderMusicFill } from "react-icons/ri";
import { useReaper } from '../contexts/ReaperContext';

const Settings = () => {
	const [hydrated, setHydrated] = useState(false);
	const { projectsPath, send } = useReaper();

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
				<button className="btn btn-square btn-primary"
					onClick={() => {
						send({ type: "readProjects" })
					}}>
					<RiFolderMusicFill size={26} />
				</button>
				<input type="text" disabled value={projectsPath} placeholder="Selecionar Pasta" className="input w-full input-primary" />
			</div>
		</div>
	)
}

export default Settings
