local _, last_path = reaper.EnumProjects(-1, "")

function watchProjectChange()
	local _, current_path = reaper.EnumProjects(-1, "")

	if current_path ~= last_path then
		local url = "http://localhost:3000/api/project/open"
		local clean_path = current_path:gsub("\\", "/")
		local payload = '{"event": "project_opened", "path": "' .. clean_path .. '"}'

		local command = ""

		command = "curl --connect-timeout 2 -m 5 -X POST -H 'Content-Type: application/json' -d '" ..
			payload .. "' " .. url .. " &"

		os.execute(command)

		last_path = current_path
	end

	reaper.defer(watchProjectChange)
end

watchProjectChange()
