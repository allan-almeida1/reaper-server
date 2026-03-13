import { useState, useEffect } from 'react'
import { useReaper } from '../contexts/ReaperContext';
import { FaSave } from "react-icons/fa";

const SaveButton = () => {
	const [hydrated, setHydrated] = useState(false);

	const { send } = useReaper();

	useEffect(() => {
		// this forces a rerender
		setHydrated(true)
	}, [])

	if (!hydrated) {
		// this returns null on first render, so the client and server match
		return null
	}
	return (
		<button className='btn btn-sm sm:btn-lg btn-circle btn-primary' onClick={() => {
			send({ type: "saveProject" })
		}}>
			<FaSave size={20} />
		</button>
	)
}

export default SaveButton
