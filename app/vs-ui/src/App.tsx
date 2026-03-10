import './App.css'
import { MdSettingsInputComponent } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { RiPlayListLine } from "react-icons/ri";
import SearchInput from './components/SearchInput';
import Playlist from './components/Playlist';
import Settings from './components/Settings';
import Transport from './components/Transport';
import { ReaperProvider } from './contexts/ReaperContext';
import Mixer from './components/Mixer';
import { MdRefresh } from "react-icons/md";

function App() {

  return (
    <ReaperProvider>
      <div className='bg-base-100 h-screen w-full overflow-hidden p-2 xl:p-20 flex flex-col'>

        <div className='flex w-full h-full gap-6 flex-col min-h-0'>

          <div className='bg-base-200 p-6 rounded-2xl w-full flex-1 flex flex-col min-h-0 relative'>
            <button className='btn btn-lg btn-circle btn-neutral absolute right-4 top-4' onClick={() => window.location.reload()}>
              <MdRefresh size={20} />
            </button>
            <div className="tabs tabs-lg tabs-box h-full border-s-0">
              <label className="tab gap-3">
                <input type="radio" name="my_tabs_4" defaultChecked />
                <RiPlayListLine />
                <span className='hidden sm:block'>Playlist</span>
              </label>
              <div className="tab-content bg-base-100 border-base-300 p-6">
                <div className='overflow-hidden flex flex-col h-full'>
                  <SearchInput />
                  <div className='divider'></div>
                  <div className='flex-1 overflow-y-auto min-h-0'>
                    <Playlist />
                  </div>
                </div>
              </div>

              <label className="tab gap-3">
                <input type="radio" name="my_tabs_4" />
                <MdSettingsInputComponent />
                <span className='hidden sm:block'>Mixer</span>
              </label>
              <div className="tab-content bg-base-100 border-base-300 p-6">
                <Mixer />
              </div>

              <label className="tab gap-3">
                <input type="radio" name="my_tabs_4" />
                <IoMdSettings />
                <span className='hidden sm:block'>Configurações</span>
              </label>
              <div className="tab-content bg-base-100 border-base-300 p-6">
                <Settings />
              </div>
            </div>
          </div>

          <div className='bg-base-200 p-6 rounded-2xl w-full'>
            <Transport />
          </div>

        </div>

      </div>
    </ReaperProvider>
  )
}

export default App
