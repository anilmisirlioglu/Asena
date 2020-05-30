import {RaffleHandler} from "./handlers/RaffleHandler";
import {RaffleHelper} from "./helpers/RaffleHelper";

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

const { CommandHandler } = require('./handlers/CommandHandler')

const webSocketConnector = new WebSocketConnector().getClient()
const client = new Client()

client.version = new Version(process.env.npm_package_version || '1.0.0', (process.argv[2] || null) === 'dev')
client.logger = new Logger()
client.commands = new Collection()
client.aliases = new Collection()
client.helpers = {
    message: new MessageHelper(client),
    channel: new ChannelHelper(client),
    raffle: new RaffleHelper(client)
}

client.categories = fs.readdirSync(`${__dirname}/commands/`)

config({
    path: `${__dirname}/../.env`
});

new CommandHandler(client)

(() => {
    const ON_RAFFLE_FINISHED = `
        subscription{
            onRaffleFinished{
                id
                prize
                channel_id
                constituent_id
                message_id
                server_id
                numbersOfWinner
                status
                finishAt
            }
        }
    `

    webSocketConnector.request({
        query: ON_RAFFLE_FINISHED,
        variables: {}
    }).subscribe({
        next: async result => {
            const raffle = result.data.onRaffleFinished
            if(raffle){
                const channel = await client.helpers.channel.fetchChannel(raffle.server_id, raffle.channel_id)
                const message = await channel.messages.fetch(raffle.message_id)
                if(message){
                    const winners = await client.helpers.raffle.identifyWinners(raffle)
                    const _message = client.helpers.raffle.getMessageURL(raffle)
                    if(winners.length === 0){
                        await channel.send(`Yeterli katılım olmadığından dolayı kazanan olmadı.\n**Çekiliş:** ${_message}`)
                    }else{
                        const winnersOfMentions = winners.map(winner => `<@${winner}>`)
                        const embed = new MessageEmbed()
                            .setAuthor(raffle.prize)
                            .setDescription(`${
                                winners.length === 1 ? `Kazanan: <@${winners.shift()}>` : `Kazananlar:\n${winnersOfMentions.join('\n')}`
                            }\nOluşturan: <@${raffle.constituent_id}>`)
                            .setFooter(`${raffle.numbersOfWinner} Kazanan | Sona Erdi`)
                            .setTimestamp(new Date(raffle.finishAt))
                            .setColor('#36393F')

                        await channel.send(`Tebrikler ${winnersOfMentions.join(', ')}! **${raffle.prize}** kazandınız\n**Çekiliş:** ${_message}`)
                        await channel.send('<:confetti:713087026051940512> **ÇEKİLİŞ BİTTİ** <:confetti:713087026051940512>', { embed })
                    }
                }
            }
        }
    })
})

client.on('ready', async() => {
    await client.user.setStatus('online');
    await client.user.setActivity(`${Constants.CONFETTI_EMOJI} Çekiliş | !ahelp`, {
        type: 'PLAYING'
    });

    client.logger.info(`Asena ${client.version.getFullVersion()} | Başlatılıyor...`)
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
                        .setAuthor('Asena | Çekiliş')
                        .setDescription(`Kullanımı: **${prefix}${command.name} ${command.usage}**`)
                        .setColor('RANDOM');

                    message.channel.send({ embed });
                }
            });
        }else{
            const embed = new MessageEmbed()
                .setAuthor('Asena | Çekiliş')
                .setDescription('Bu komutu kullanmak için **yetkiniz** yok.')
                .setColor('RED');

            message.channel.send({ embed });
        }
    }
});

client.login(process.env.TOKEN || null).then();