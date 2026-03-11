function sendProjectInfo()
	local _, current_path = reaper.EnumProjects(-1, "")

	if not current_path then
		current_path = ""
	end

	local clean_path = current_path:gsub("\\", "/")

	local project_name = clean_path:match("([^/]+)%.[Rr][Pp][Pp]")

	if not project_name then
		project_name = "Untitled"
	end

	local payload = string.format(
		'{"event": "project_info", "name": "%s", "path": "%s"}',
		project_name,
		clean_path
	)

	local url = "http://localhost:3000/api/project_info"

	local command = string.format(
		"curl --silent --connect-timeout 2 -m 5 -X POST -H 'Content-Type: application/json' -d '%s' %s &",
		payload,
		url
	)

	os.execute(command)
end

sendProjectInfo()
