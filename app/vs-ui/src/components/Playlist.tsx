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
];

const genreColorMap = {
	// Cores equalizadas para uso como Background com texto Cloud White (#F8FAFC)
	REGGAE: "#3A414A",    // Era branco. Agora é um Cinza Chumbo neutro.
	AXE: "#236B4D",       // Era verde claro. Agora é um Verde Esmeralda profundo.
	IJEXA: "#216A8C",     // Era ciano. Agora é um Azul Oceano/Ciano escuro.
	ARROCHA: "#8A5C3D",   // Era pêssego. Agora é um tom de Cobre/Âmbar escurecido.
	LAMBADA: "#525B69",   // Era cinza claro. Agora é um Cinza Ardósia frio.
	SERTANEJO: "#8A4147", // Era coral. Agora é um Vermelho Carmim suave.
	SAMBA: "#8A7429",     // Era amarelo. Agora é um Ouro Velho.
	PAGODE: "#804164",    // Era rosa. Agora é um Rosa Ameixa (combina com o Secondary).
	GALOPE: "#53467A"     // Era lilás. Agora é um Índigo/Roxo profundo.
};

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
			<table className="table table-md table-zebra">
				<tbody>
					{filteredProjects.map((project) => (
						<tr key={project.path}>
							<td className='text-base-content cursor-pointer border-y border-base-300 flex flex-row justify-between'
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
									className="w-30 text-[#F8FAFC] text-center hidden sm:block font-bold">
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
