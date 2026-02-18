fx_version 'cerulean'
game 'gta5'

author 'Your Name'
description 'Kill Notification System with Videos and Audio'
version '1.0.0'

ui_page 'web/index.html'

client_scripts {
    'client.lua'
}
server_scripts {
    'server.lua'
}
files {
    'web/index.html',
    'web/sounds/**/*',
    'web/vids/**/*',
    'web/css/*',
    'web/js/*'
}
