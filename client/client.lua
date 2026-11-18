local lastKillTime = 0
local killCount = 0
local killResetTime = Config.killResetTime -- Time allowed between kills in milliseconds

RegisterNetEvent('hud:updateKill')
AddEventHandler('hud:updateKill', function(weaponHash)
    local currentTime = GetGameTimer()

    if (currentTime - lastKillTime) <= killResetTime then
        killCount = killCount + 1
    else
        killCount = 1
    end

    lastKillTime = currentTime

    -- Keep the weapon from the moment of the kill. The player may switch
    -- weapons before the server event gets back to this client.
    SendNUIMessage({
        type = "playerKill",
        killStreak = killCount,
        weaponHash = weaponHash
    })
end)

AddEventHandler('gameEventTriggered', function(event, args)
    if event ~= "CEventNetworkEntityDamage" or args[6] ~= 1 then
        return
    end

    local victimPed = args[1]
    local attacker = args[2]
    local playerPed = PlayerPedId()

    if not IsEntityAPed(victimPed) or not IsPedAPlayer(victimPed) then
        return
    end

    -- Ignore events where the local player was not the attacker.
    if attacker ~= playerPed or victimPed == playerPed then
        return
    end

    local _, weaponHash = GetCurrentPedWeapon(playerPed, true)
    TriggerServerEvent('playerKilled', weaponHash)
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
