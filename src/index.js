require('./connections')()

const call = require('./utils/call')

const { Client, Collection, MessageEmbed } = require('discord.js')
const { config } = require('dotenv')
const fs = require('fs')

const client = new Client()

const { Constants } = require('Constants')

client.commands = new Collection()
client.aliases = new Collection()

client.categories = fs.readdirSync(`${__dirname}/commands/`);

config({
    path: `${__dirname}/../.env`
});

['command'].forEach(handler => {
    require(`${__dirname}/handlers/${handler}`)(client)
})

client.on('ready', async() => {
    await client.user.setStatus('online');
    await client.user.setActivity(`${Constants.CONFETTI_EMOJI} Çekiliş | !ahelp`, {
        type: 'PLAYING'
    });

    client.logger.info(`${client.user.username} aktif, toplam ${client.guilds.cache.size} sunucu ve ${client.users.cache.size} kullanıcıya hizmet veriliyor!`);
});
