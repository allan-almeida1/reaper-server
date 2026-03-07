import './App.css'
import useReaperSocket from './hooks/useReaperSocket'
import TrackComponent from './components/TrackComponent';

function App() {

  const { state, send } = useReaperSocket();

  if (!state) {
    return <div>Loading...</div>
  }

  return (
    <>
      <h2>Tracks</h2>

      {state.tracks.map(track => (
        <TrackComponent
          key={track.id}
          track={track}
          send={send}
        />
      ))}
    </>
  )
}

export default App
