'use client'
import { useState, useEffect } from 'react'
import { useReaper } from '../contexts/ReaperContext'

const genres = [
	"REGGAE",
	"AXE",
	"IJEXA",
	"ARROCHA",
	"LAMBADA",
	"SERTANEJO",
	"SAMBA",
	"PAGODE",
	"GALOPE"
]

const genreColorMap = {
	REGGAE: "#fafafa",
	AXE: "#e4ffd4",
	IJEXA: "#c6f4ff",
	ARROCHA: "#ffeabd",
	LAMBADA: "#cbcbcb",
	SERTANEJO: "#ffa895",
	SAMBA: "#ffe87e",
	PAGODE: "#ffc8dd",
	GALOPE: "#dfd7ff"
}

const Playlist = () => {
	const [hydrated, setHydrated] = useState(false);

	const { projects, send, setIsOpeningProject } = useReaper();

	const getProjectColor = (name: string) => {
		// Get the first two letters of the project name and convert to number
		const prefix = parseInt(name.slice(0, 2))
		if (isNaN(prefix)) {
			return "#fff"
		}
		const genreIndex = prefix % genres.length - 1
		const genre = genres[genreIndex]
		return genreColorMap[genre as keyof typeof genreColorMap] || "#fff"
	}

	useEffect(() => {
		// this forces a rerender
		setHydrated(true)
	}, [])

	if (!hydrated) {
		// this returns null on first render, so the client and server match
		return null
	}
	return (
		<div className="w-full">
			<table className="table table-md">
				<tbody>
					{projects?.map((project) => (
						<tr key={project.path}>
							<td style={
								{ backgroundColor: getProjectColor(project.name) }
							}
								className='text-base-100 cursor-pointer border-y-2'
								onClick={() => {
									send({ type: "openProject", payload: project.path })
									setIsOpeningProject(true);
								}}
							>{project.name}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default Playlist
