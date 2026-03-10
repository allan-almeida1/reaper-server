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

interface PlaylistProps {
	searchTerm: string;
}

const Playlist = ({ searchTerm }: PlaylistProps) => {
	const [hydrated, setHydrated] = useState(false);

	const { projects, send, setIsOpeningProject } = useReaper();

	const getProjectColor = (name: string) => {
		// Get the first two letters of the project name and convert to number
		const prefix = parseInt(name.slice(0, 2))
		if (isNaN(prefix)) {
			return "#fff"
		}
		const genreIndex = prefix % genres.length
		const genre = genres[genreIndex]
		return genreColorMap[genre as keyof typeof genreColorMap] || "#fff"
	}

	const getProjectGenre = (name: string) => {
		// Get the first two letters of the project name and convert to number
		const prefix = parseInt(name.slice(0, 2))
		if (isNaN(prefix)) {
			return "Unknown"
		}
		const genreIndex = prefix % genres.length
		return genres[genreIndex] || "Unknown"
	}

	const filteredProjects = projects?.filter(project => project.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

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
					{filteredProjects.map((project) => (
						<tr key={project.path}>
							<td className='text-base-content cursor-pointer border-y flex flex-row justify-between'
								onClick={() => {
									send({ type: "openProject", payload: project.path })
									setIsOpeningProject(true);
								}}
							>
								<span>
									{project.name}
								</span>
								<div style={
									{ backgroundColor: getProjectColor(project.name) }
								}
									className="w-30 text-base-100 text-center hidden sm:block font-bold">
									{getProjectGenre(project.name)}
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default Playlist
