local lastKillTime = 0
local killCount = 0
local killResetTime = Config.killResetTime -- Time allowed between kills in milliseconds
local reportedVictims = {}

RegisterNetEvent('hud:updateKill')
AddEventHandler('hud:updateKill', function(weaponHash)
    local currentTime = GetGameTimer()

    if (currentTime - lastKillTime) <= killResetTime then
        killCount = killCount + 1
    else
        killCount = 1
    end

    lastKillTime = currentTime

    SendNUIMessage({
        type = "playerKill",
        killStreak = killCount,
        weaponHash = weaponHash
    })
end)

AddEventHandler('gameEventTriggered', function(event, args)
    if event ~= "CEventNetworkEntityDamage" then
        return
    end

    local victimPed = args[1]
    local attacker = args[2]
    local wasFatal = args[6] == 1
    local weaponHash = args[7]
    local playerPed = PlayerPedId()

    if not wasFatal then
        return
    end

    if not IsEntityAPed(victimPed) or not IsPedAPlayer(victimPed) then
        return
    end

    if attacker ~= playerPed or victimPed == playerPed then
        return
    end

    local currentTime = GetGameTimer()

    -- Remove old entries so reused entity handles do not block future kills.
    for reportedVictim, reportTime in pairs(reportedVictims) do
        if currentTime - reportTime > 5000 then
            reportedVictims[reportedVictim] = nil
        end
    end

    if reportedVictims[victimPed] then
        return
    end

    local victimNetId = NetworkGetNetworkIdFromEntity(victimPed)
    if victimNetId == 0 then
        return
    end

    reportedVictims[victimPed] = currentTime
    TriggerServerEvent('playerKilled', victimNetId, weaponHash)
end)

RegisterCommand("testkill", function(source, args)
    if not Config.Debug then
        return
    end

    local requestedCount = tonumber(args[1]) or 1
    local testKillCount = math.max(1, math.min(math.floor(requestedCount), 6))
    local _, weaponHash = GetCurrentPedWeapon(PlayerPedId(), true)

    SendNUIMessage({
        type = "playerKill",
        killStreak = testKillCount,
        weaponHash = weaponHash
    })
end)

function Debugprint(...)
    if Config.Debug then
        print(...)
    end
end
