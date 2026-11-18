local pendingKillReports = {}
local lastAcceptedKill = {}

-- Record fatal-damage candidates observed by the server.
-- willKill is supplied by the attacking client, so it is a signal to validate,
-- not independent proof that the victim died.
AddEventHandler('weaponDamageEvent', function(sender, data)
    if type(data) ~= 'table' or data.willKill ~= true then
        return
    end

    local weaponHash = data.weaponType
    if type(weaponHash) ~= 'number' then
        return
    end

    local victimIds = data.hitGlobalIds
    if type(victimIds) ~= 'table' or #victimIds == 0 then
        victimIds = { data.hitGlobalId }
    end

    pendingKillReports[sender] = pendingKillReports[sender] or {}
    local reports = pendingKillReports[sender]
    local currentTime = GetGameTimer()

    -- Keep the cache short-lived and bounded to recent victim IDs.
    for victimNetId, report in pairs(reports) do
        if currentTime - report.time > Config.killReportWindow then
            reports[victimNetId] = nil
        end
    end

    for _, victimNetId in ipairs(victimIds) do
        if type(victimNetId) == 'number' and victimNetId > 0 then
            reports[victimNetId] = {
                weaponHash = weaponHash,
                time = currentTime
            }
        end
    end
end)

RegisterNetEvent('playerKilled')
AddEventHandler('playerKilled', function(victimNetId, weaponHash)
    local src = source

    if type(victimNetId) ~= 'number' or victimNetId <= 0 then
        return
    end

    if type(weaponHash) ~= 'number' then
        return
    end

    local reports = pendingKillReports[src]
    local report = reports and reports[victimNetId]
    if not report then
        return
    end

    local currentTime = GetGameTimer()
    if currentTime - report.time > Config.killReportWindow then
        reports[victimNetId] = nil
        return
    end

    if report.weaponHash ~= weaponHash then
        return
    end

    -- Consume the candidate so the same damage event cannot be replayed.
    reports[victimNetId] = nil

    local lastKill = lastAcceptedKill[src] or 0
    if currentTime - lastKill < Config.killReportRateLimit then
        return
    end

    local victimEntity = NetworkGetEntityFromNetworkId(victimNetId)
    if victimEntity == 0 or not DoesEntityExist(victimEntity) then
        return
    end

    if GetEntityType(victimEntity) ~= 1 then
        return
    end

    local victimOwner = NetworkGetEntityOwner(victimEntity)
    if victimOwner == 0 or victimOwner == src then
        return
    end

    if GetPlayerPed(victimOwner) ~= victimEntity then
        return
    end

    lastAcceptedKill[src] = currentTime
    TriggerClientEvent('hud:updateKill', src, report.weaponHash)
end)

AddEventHandler('playerDropped', function()
    local src = source
    pendingKillReports[src] = nil
    lastAcceptedKill[src] = nil
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
