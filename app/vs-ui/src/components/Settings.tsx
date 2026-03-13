import { useState, useEffect } from 'react'
import { RiFolderMusicFill } from "react-icons/ri";
import { TbPlugConnected } from "react-icons/tb";
import { useReaper } from '../contexts/ReaperContext';
import { IoCloseSharp } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import { FaPowerOff } from "react-icons/fa6";

const Settings = () => {
	const [hydrated, setHydrated] = useState(false);
	const {
		projectsPath,
		send,
		onConfigureReaperDeviceResult,
		onOpenReaperResult,
		onCloseReaperResult,
		onProjectsLoaded
	} = useReaper();

	useEffect(() => {
		// this forces a rerender
		setHydrated(true)
	}, [])

	const notify = (message: string, success: boolean) => {
		if (success) {
			toast.success(message);
		} else {
			toast.error(message);
		}
	}

	useEffect(() => {
		const unsubscribe = onConfigureReaperDeviceResult((success) => {
			if (success) {
				notify("Reaper configured successfully for X18/XR18!", true);
			} else {
				notify("Failed to configure Reaper for X18/XR18. Please check the server logs for more details.", false);
			}
		});

		return () => {
			unsubscribe();
		};
	}, [onConfigureReaperDeviceResult])

	useEffect(() => {
		const unsubscribe = onOpenReaperResult((success) => {
			if (success) {
				notify("Reaper opened successfully!", true);
			} else {
				notify("Failed to open Reaper. Please check the server logs for more details.", false);
			}
		});

		return () => {
			unsubscribe();
		};
	}, [onOpenReaperResult])

	useEffect(() => {
		const unsubscribe = onCloseReaperResult((success) => {
			if (success) {
				notify("Reaper closed successfully!", true);
			} else {
				notify("Failed to close Reaper. Please check the server logs for more details.", false);
			}
		});

		return () => {
			unsubscribe();
		};
	}, [onCloseReaperResult])

	useEffect(() => {
		const unsubscribe = onProjectsLoaded((projects_count) => {
			notify(`Loaded ${projects_count} projects successfully!`, true);
		});

		return () => {
			unsubscribe();
		};
	}, [onProjectsLoaded])

	const confirmAndPowerOff = () => {
		if (window.confirm("Are you sure you want to power off the server?")) {
			send({ type: "powerOff" })
		}
	}

	if (!hydrated) {
		// this returns null on first render, so the client and server match
		return null
	}
	return (
		<div className='flex flex-col gap-10 h-full'>
			<ToastContainer
				theme='dark'
				position='top-center'
				autoClose={3000}
			/>
			<div className='flex items-center gap-4'>
				<button className="btn btn-square btn-primary btn-xl"
					onClick={() => {
						send({ type: "readProjects" })
					}}>
					<RiFolderMusicFill size={36} />
				</button>
				<input type="text" disabled value={projectsPath} placeholder="Selecionar Pasta" className="input w-full input-primary" />
			</div>

			<div className='flex items-center gap-4'>

				<button className="btn btn-square btn-xl"
					onClick={() => {
						send({ type: "configureReaperForX18" })
					}}>
					<TbPlugConnected size={36} />
				</button>
				<span className='text-left'>Click to set Reaper Audio Device to X18</span>
			</div>

			<div className='flex items-center gap-4 flex-wrap justify-center sm:justify-start'>

				<button className="flex btn btn-square btn-xl btn-wide"
					onClick={() => {
						send({ type: "openReaper" })
					}}>
					<img
						src='/reaper.svg'
						className='w-10 h-10'
					/> OPEN Reaper
				</button>

				<button className="flex btn btn-square btn-xl btn-wide btn-neutral"
					onClick={() => {
						send({ type: "closeReaper" })
					}}>
					<img
						src='/reaper.svg'
						className='w-10 h-10'
					/> CLOSE Reaper <IoCloseSharp className='text-red-500' size={36} />
				</button>
			</div>

			<div className='flex h-full flex-col items-center justify-end gap-4'>
				<button className='btn btn-circle btn-xl btn-error'
					onClick={confirmAndPowerOff}
				>
					<FaPowerOff size={36} />
				</button>
				<span className='text-sm text-gray-500'>DESLIGAR SERVIDOR</span>
			</div>
		</div>
	)
}

export default Settings
