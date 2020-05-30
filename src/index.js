require('./connections')()

const call = require('./utils/call')

const { Client, Collection, MessageEmbed } = require('discord.js')
const { config } = require('dotenv')
const fs = require('fs')

const { Constants } = require('Constants')
const { Command } = require('./commands/Command')
const { Version } = require('./utils/Version')
const { Logger } = require('./utils/Logger')
const { WebSocketConnector } = require('./network/WebSocketConnector')
const { MessageHelper } = require('./helpers/MessageHelper')
const { ChannelHelper } = require('./helpers/ChannelHelper')

const webSocketConnector = new WebSocketConnector().getClient()
const client = new Client()

client.version = new Version(process.env.npm_package_version || '1.0.0', (process.argv[2] || null) === 'dev');
client.logger = new Logger();
client.commands = new Collection()
client.aliases = new Collection()
client.helpers = {
    message: new MessageHelper(client),
    channel: new ChannelHelper(client)
}

client.categories = fs.readdirSync(`${__dirname}/commands/`)

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

// Komut Yürütme Protokolü
client.on('message', async message => {
    if(message.guild === null) return;

    const prefix = process.env.PREFIX;

    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;

    if(!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if(cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if(!command) command = client.commands.get(client.aliases.get(cmd));

    if(command){
        const authorized = command.permission === undefined ? true : message.member.hasPermission(command.permission);
        if(authorized && command instanceof Command){
            command.run(client, message, args).then(result => {
                if(!result){
                    const embed = new MessageEmbed()
                        .addField('Kullanımı', `${prefix}${command.name} ${command.usage}`)
                        .setColor('RANDOM');

                    message.channel.send({ embed });
                }
            });
        }else{
            const embed = new MessageEmbed()
                .addField('Yetki Hatası', 'Bu komutu kullanmak için yetkiniz yok.')
                .setColor('RED');

            message.channel.send({ embed });
        }
    }
});

client.login(process.env.TOKEN || null).then();