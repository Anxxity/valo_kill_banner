RegisterNetEvent('playerKilled')
AddEventHandler('playerKilled', function(weaponHash)
    local src = source

    -- The weapon hash only selects the local banner theme.
    -- It is not proof that a legitimate kill happened.
    TriggerClientEvent('hud:updateKill', src, weaponHash)
end)

local function isNewerVersion(remoteVersion, currentVersion)
    local remoteParts = {}
    local currentParts = {}

    for part in string.gmatch(remoteVersion, "%d+") do
        remoteParts[#remoteParts + 1] = tonumber(part)
    end

    for part in string.gmatch(currentVersion, "%d+") do
        currentParts[#currentParts + 1] = tonumber(part)
    end

    local partCount = math.max(#remoteParts, #currentParts)

    for i = 1, partCount do
        local remotePart = remoteParts[i] or 0
        local currentPart = currentParts[i] or 0

        if remotePart > currentPart then
            return true
        elseif remotePart < currentPart then
            return false
        end
    end

    return false
end

local function checkForUpdates()
    local resourceName = GetCurrentResourceName()
    local currentVersion = GetResourceMetadata(resourceName, 'version', 0)

    if not currentVersion then
        print(('^1[%s] Could not read the resource version from fxmanifest.lua.^0'):format(resourceName))
        return
    end

    local versionUrl = 'https://raw.githubusercontent.com/Anxxity/valo_kill_banner/main/version.json'

    PerformHttpRequest(versionUrl, function(statusCode, response)
        if statusCode ~= 200 or not response then
            print(('^3[%s] Version check failed (HTTP %s). Check your server connection.^0'):format(resourceName, statusCode))
            return
        end

        local success, versionData = pcall(json.decode, response)
        if not success or type(versionData) ~= 'table' or type(versionData.version) ~= 'string' then
            print(('^1[%s] Could not read version.json from GitHub.^0'):format(resourceName))
            return
        end

        local latestVersion = versionData.version

        if isNewerVersion(latestVersion, currentVersion) then
            print(('^3[%s] Update available: v%s (you are running v%s).^0'):format(resourceName, latestVersion, currentVersion))
            print(('^3[%s] Download: https://github.com/Anxxity/valo_kill_banner/releases/latest^0'):format(resourceName))
        else
            print(('^2[%s] You are running the latest version (v%s).^0'):format(resourceName, currentVersion))
        end
    end, 'GET')
end

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then
        return
    end

    checkForUpdates()
end)
