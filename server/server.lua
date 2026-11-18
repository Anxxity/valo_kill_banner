RegisterNetEvent('playerKilled')
AddEventHandler('playerKilled', function(weaponHash)
    local src = source

    -- The weapon hash only selects the local banner theme.
    -- It is not proof that a legitimate kill happened.
    TriggerClientEvent('hud:updateKill', src, weaponHash)
end)
