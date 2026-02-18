RegisterServerEvent('playerKilled')
AddEventHandler('playerKilled', function()
    local src = source
    TriggerClientEvent('hud:updateKill', src)
end)
