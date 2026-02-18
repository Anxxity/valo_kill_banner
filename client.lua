local lastKillTime = 0
local killCount = 0
local killResetTime = 10000 -- 10 seconds in milliseconds


RegisterNetEvent('hud:updateKill')
AddEventHandler('hud:updateKill', function()
    local currentTime = GetGameTimer()
    
    if (currentTime - lastKillTime) <= killResetTime then
        killCount = killCount + 1
    else
        killCount = 1
    end
    lastKillTime = currentTime
    local ped = PlayerPedId()
    local hasWeapon, weaponHash = GetCurrentPedWeapon(ped, true)

   SendNUIMessage({
        type = "playerKill",
        killStreak = killCount,
        weaponHash = weaponHash
    })
end)

AddEventHandler('gameEventTriggered', function(event, args)
    if event == "CEventNetworkEntityDamage" and args[6] == 1 then
        if not IsEntityAPed(args[1]) or not IsPedAPlayer(args[1]) then
            return
        end

        local victimPed = args[1]
        local attacker = args[2]

        if attacker == PlayerPedId() then
            TriggerServerEvent('playerKilled')
        end
    end
end)


RegisterCommand("testkill", function(source, args, rawCommand)
    local killCount = 1

    local ped = PlayerPedId()
    local hasWeapon, weaponHash = GetCurrentPedWeapon(ped, true)

    print("Has weapon:", hasWeapon)
    print("Weapon hash:", weaponHash)

    if args[1] then
        killCount = tonumber(args[1])
    end
    SendNUIMessage({
        type = "playerKill",
        killStreak = killCount,
        weaponHash = weaponHash
    })
    
end) 

