import Command, { Group, Result } from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { CommandInteraction, GuildMember, MessageEmbed, VoiceChannel } from 'discord.js';
import RandomArray from '../../utils/RandomArray';

export default class Soundaway extends Command{

    constructor(){
        super({
            name: 'soundaway',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.soundaway.description',
            permission: 'ADMINISTRATOR',
            examples: [
                'winners: 1',
                'winners: 2 title: Voice Channels Giveaway Title',
                'winners: 3 user: @User',
                'winners: 4 channel: #Channel',
                'winners: 5 title: Asena Giveaway channel: #Channel',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<Result>{
        const numberOfWinners = action.options.getInteger('winners', true)
        if(numberOfWinners < 1 || numberOfWinners > 20){
            return this.error('commands.raffle.soundaway.limits.winner.count')
        }

        const title = action.options.getString('title', false)
        if(title && title.length > 255){
            return this.error('commands.raffle.soundaway.limits.title.length')
        }

        let pool = [], ch
        const member = action.options.getMember('user', false)
        const voice = action.options.getChannel('channel', false)
        if(!(member || voice)){
            pool = action.guild.channels.cache
                .filter(channel =>
                    channel.type == 'GUILD_VOICE' &&
                    channel.viewable &&
                    channel.members.size > 0
                )
                .map(channel => [...(channel as VoiceChannel).members.keys()] ?? [])
                .reduce((prev, curr) => prev.concat(curr), [])

            if(pool.length === 0){
                return this.error('commands.raffle.soundaway.voice.channel.in.not.found.users')
            }

            ch = server.translate('commands.raffle.soundaway.voice.channel.all')
        }else{
            const channel = voice ?? (member as GuildMember)?.voice.channel
            if(!channel){
                return this.error(member ? 'commands.raffle.soundaway.voice.channel.not.in.user' : 'commands.raffle.soundaway.voice.channel.not.found')
            }

            if(channel.type !== 'GUILD_VOICE'){
                return this.error('commands.raffle.soundaway.voice.channel.invalid')
            }

            if(!channel.viewable){
                return this.error('commands.raffle.soundaway.voice.channel.unauthorized')
            }

            if(channel.members.size == 0){
                return this.error('commands.raffle.soundaway.voice.channel.in.not.found.user')
            }

            pool = [...channel.members.keys()]
            ch = channel.name
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
                `:reminder_ribbon: ${server.translate('structures.raffle.embed.fields.creator')}: ${action.member}`
            ].join('\n'))
            .setFooter(`${server.translate('structures.raffle.embed.footer.text', numberOfWinners)} | ${server.translate('structures.raffle.embed.footer.finish')}`)
            .setTimestamp()
            .setColor('#36393F')

        await action.reply({
            content: `:tada: **${server.translate('structures.raffle.messages.quick')}** :tada:`,
            embeds: [embed]
        })

        return null
    }

}
