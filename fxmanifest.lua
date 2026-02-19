fx_version 'cerulean'
game 'gta5'

author 'Remin mohammed'
description 'Valorant kill banner'
version '1.0.1'

ui_page 'web/index.html'

client_scripts {
    'client/client.lua'
}
server_scripts {
    'server/server.lua'
}

shared_scripts { 
	'shared/config.lua'
}

files {
    'shared/config.js',
    'web/index.html',
    'web/sounds/**/*',
    'web/vids/**/*',
    'web/css/*',
    'web/js/*'
}
