
import type { Track, Command } from "@reaper/shared";

interface TrackComponentProps {
	track: Track;
	send: (cmd: Command) => void;
}

export default function TrackComponent({ track, send }: TrackComponentProps) {
	return (
		<div style={{ marginBottom: 20 }}>
			<b>{track.name}</b>

			<button
				onClick={() => {
					send({
						type: "mute",
						payload: track.id
					})
				}}
			/>
		</div>
	)
}
