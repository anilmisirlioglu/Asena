import Command, { Group } from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Message, MessageEmbed } from 'discord.js';
import RandomArray from '../../utils/RandomArray';

export default class Soundaway extends Command{

    constructor(){
        super({
            name: 'soundaway',
            group: Group.GIVEAWAY,
            aliases: ['voice', 'voiceaway', 'soundstart', 'sesçekiliş'],
            description: 'commands.raffle.soundaway.description',
            usage: 'commands.raffle.soundaway.usage',
            permission: 'ADMINISTRATOR',
            examples: [
                '1',
                '1 All Voice Channels Giveaway Title',
                '5 @User',
                '3 @User Test Title',
                '7 789102011081162784 Test Title'
            ]
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        if(args.length < 1) return false

        const numberOfWinners = parseInt(args[0])
        if(isNaN(numberOfWinners)) return false

        if(numberOfWinners < 1 || numberOfWinners > 20){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.soundaway.limits.winner.count'))
            })

            return true
        }

        let pool = [], index, ch
        const arg1 = args[1]
        if(!(this.isValidSnowflake(arg1) || message.mentions.members.first())){
            pool = message.guild.channels.cache
                .filter(channel =>
                    channel.type == 'voice' &&
                    channel.viewable &&
                    channel.members.size > 0
                )
                .map(channel => channel.members.keyArray() ?? [])
                .reduce((prev, curr) => prev.concat(curr), [])

            if(pool.length === 0){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.soundaway.voice.channel.in.not.found.users'))
                })

                return true
            }

            index = 1
            ch = server.translate('commands.raffle.soundaway.voice.channel.all')
        }else{
            const channel = this.isValidSnowflake(arg1) ?
                message.guild.channels.cache.get(arg1) :
                message.mentions.members.first()?.voice.channel

            if(!channel){
                await message.channel.send({
                    embed: this.getErrorEmbed(message.mentions.members.first() ?
                        server.translate('commands.raffle.soundaway.voice.channel.not.in.user') :
                        server.translate('commands.raffle.soundaway.voice.channel.not.found')
                    )
                })

                return true
            }

            if(channel.type !== 'voice'){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.soundaway.voice.channel.invalid'))
                })

                return true
            }

            if(!channel.viewable){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.soundaway.voice.channel.unauthorized'))
                })

                return true
            }

            if(channel.members.size == 0){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.soundaway.voice.channel.in.not.found.user'))
                })

                return true
            }

            pool = channel.members.keyArray()
            index = 2
            ch = channel.name
        }

        let title
        if(args[index]){
            title = args.slice(index, args.length).join(' ')
            if(title.length > 255){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.soundaway.limits.title.length'))
                })

                return true
            }
        }

        const winners = []
        if(pool.length > numberOfWinners){
            const random = new RandomArray(pool)
            random.shuffle()
            winners.push(...random.random(numberOfWinners))
        }else{
            winners.push(...pool)
        }

        const description = winners.length === 0 ?
            server.translate('structures.raffle.winners.none.description') :
            winners.length === 1 ?
                `${server.translate('structures.raffle.winners.single.description')}: <@${winners[0]}>` :
                `${server.translate('structures.raffle.winners.plural.description')}:\n${winners.map(winner => `:small_blue_diamond: <@${winner}>`).join('\n')}`

        const embed = new MessageEmbed()
            .setAuthor(title ? title : `🔊 ${ch}`)
            .setDescription([
                `:medal: ${description}`,
                `:reminder_ribbon: ${server.translate('structures.raffle.embed.fields.creator')}: ${message.author}`
            ])
            .setFooter(`${server.translate('structures.raffle.embed.footer.text', numberOfWinners)} | ${server.translate('structures.raffle.embed.footer.finish')}`)
            .setTimestamp()
            .setColor('#36393F')

        await message.channel.send(`:tada: **${server.translate('structures.raffle.messages.quick')}** :tada:`, {
            embed
        })

        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 0
            })
        }

        return true
    }

}
