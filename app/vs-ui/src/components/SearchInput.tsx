interface SearchInputProps {
	onChange: (term: string) => void;
	onEnterPressed?: () => void;
}

const SearchInput = ({ onChange, onEnterPressed }: SearchInputProps) => {

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			onChange((e.target as HTMLInputElement).value);
			(e.target as HTMLInputElement).blur();
			console.log("Apertou enter")
			if (onEnterPressed) {
				onEnterPressed();
			}
		}
	};

	return (
		<label className="input w-full text-xl">
			<svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<g
					strokeLinejoin="round"
					strokeLinecap="round"
					strokeWidth="2.5"
					fill="none"
					stroke="currentColor"
				>
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.3-4.3"></path>
				</g>
			</svg>
			<input className="uppercase" type="search" required placeholder="Buscar" onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} />
		</label>
	)
}

export default SearchInput
