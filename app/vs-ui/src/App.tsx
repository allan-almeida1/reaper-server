import './App.css'
import useReaperSocket from './hooks/useReaperSocket'
import TrackComponent from './components/TrackComponent';
import type { Track } from '@reaper/shared'
import { MdSettingsInputComponent } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { RiPlayListLine } from "react-icons/ri";
import SearchInput from './components/SearchInput';
import Playlist from './components/Playlist';
import Settings from './components/Settings';

function App() {

  const { state, projects, send } = useReaperSocket();

  if (!state) {
    return <div>Loading...</div>
  }

  return (
    <div className='bg-base-100 h-screen w-full overflow-hidden p-4 xl:p-20 flex flex-col'>

      <div className='flex w-full h-full gap-6 flex-col sm:flex-row'>

        <div className='bg-base-200 p-6 rounded-2xl w-full flex-6'>
          <div className="tabs tabs-lg tabs-box h-full border-s-0">
            <label className="tab gap-3">
              <input type="radio" name="my_tabs_4" defaultChecked />
              <RiPlayListLine />
              Playlist
            </label>
            <div className="tab-content bg-base-100 border-base-300 p-6">
              <div className='overflow-hidden flex flex-col h-full'>
                <SearchInput />
                <div className='divider'></div>
                <div className='flex-1 overflow-y-auto min-h-0'>
                  <Playlist projects={projects} />
                </div>
              </div>
            </div>

            <label className="tab gap-3">
              <input type="radio" name="my_tabs_4" />
              <MdSettingsInputComponent />
              Tracks
            </label>
            <div className="tab-content bg-base-100 border-base-300 p-6 overflow-y-auto">
              <ul className='list'>
                {state.tracks.map((track: Track) => (
                  <TrackComponent
                    key={track.id}
                    track={track}
                    send={send}
                  />
                ))}
              </ul>
            </div>

            <label className="tab gap-3">
              <input type="radio" name="my_tabs_4" />
              <IoMdSettings />
              Configurações
            </label>
            <div className="tab-content bg-base-100 border-base-300 p-6">
              <Settings />
            </div>
          </div>
        </div>

        <div className='bg-base-200 p-6 rounded-2xl w-full flex-4'>
          Teste
        </div>

      </div>

    </div>
  )
}

export default App
