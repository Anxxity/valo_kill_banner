local lastKillTime = 0
local killCount = 0
local killResetTime = 5000 -- 5 seconds in milliseconds


RegisterNetEvent('hud:updateKill')
AddEventHandler('hud:updateKill', function()
    local currentTime = GetGameTimer()
    
    if (currentTime - lastKillTime) <= killResetTime then
        killCount = killCount + 1
    else
        killCount = 1
    end

    lastKillTime = currentTime
    SendNUIMessage({
        type = "playerKill",
        killStreak = killCount
    })
end)

AddEventHandler('gameEventTriggered', function(event, args)
    if event == "CEventNetworkEntityDamage" and args[6] == 1 then
        if not IsEntityAPed(args[1]) or not IsPedAPlayer(args[1]) then
            return
        end

        local victimPed = args[1]
        local attacker = args[2]

        -- Only trigger if the local player is the attacker
      --  if attacker == PlayerPedId() then
            TriggerEvent('hud:updateKill')
       -- end
    end
end)






-- Console command to test kill notifications
RegisterCommand("testkill", function(source, args, rawCommand)
    local killCount = 1
    if args[1] then
        killCount = tonumber(args[1])
    end
    
    SendNUIMessage({
        type = "playerKill",
        killStreak = killCount
    })
    
    print("^2[Test Kill] ^7Kill count set to: " .. killCount)
end) 

