-- Nome do dispositivo como aparece no REAPER (ex: "X18/XR18")
local device_name = "JACK"

-- 1. Altera as configurações no buffer do REAPER
reaper.SNM_SetStringConfigVar("linux_alsa_device_in", device_name)
reaper.SNM_SetStringConfigVar("linux_alsa_device_out", device_name)

-- 2. Força o REAPER a reiniciar o dispositivo de áudio para aplicar a mudança
-- Action ID 44353: Audio: Close/reset audio device
reaper.Main_OnCommand(44353, 0)

reaper.ShowConsoleMsg("Audio device alterado para: " .. device_name)
