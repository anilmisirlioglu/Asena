import {
    GuildChannel,
    Message,
    MessageEmbed,
    MessageReaction,
    Snowflake,
    TextChannel
} from 'discord.js';
import Structure from './Structure';
import RaffleModel, { IRaffle, RaffleStatus } from '../models/Raffle';
import Timestamps from '../models/legacy/Timestamps';
import { secondsToString } from '../utils/DateTimeHelper';
import Constants from '../Constants';
import ArrayRandom from '../array/ArrayRandom';
import ID from '../models/legacy/ID';
import SuperClient from '../SuperClient';
import Server from './Server';

type SuperRaffle = IRaffle & Timestamps & ID

// TODO::keep server model in cache
class Raffle extends Structure<typeof RaffleModel, SuperRaffle>{

    public prize: string
    public server_id: Snowflake
    public constituent_id: Snowflake
    public channel_id: Snowflake
    public message_id?: Snowflake
    public numbersOfWinner: number
    public status: RaffleStatus
    public finishAt: Date

    constructor(data: SuperRaffle){
        super(RaffleModel, data)
    }

    protected patch(data: SuperRaffle){
        this.prize = data.prize
        this.server_id = data.server_id
        this.constituent_id = data.constituent_id
        this.channel_id = data.channel_id
        this.server_id = data.server_id
        this.message_id = data.message_id
        this.numbersOfWinner = data.numbersOfWinner
        this.status = data.status
        this.finishAt = data.finishAt
    }

    protected identifierKey(): string{
        return 'message_id'
    }

    public isContinues(): boolean{
        return this.status === 'CONTINUES'
    }

    public async setStatus(status: RaffleStatus){
        await this.update({ status })
    }

    public isCancelable(): boolean{
        return this.isContinues()
    }

    public async setCanceled(){
        await this.setStatus('CANCELED')
    }

    public async finish(client: SuperClient, server: Server){
        await this.setStatus('FINISHED')

        const channel: GuildChannel | undefined = await client.fetchChannel(this.server_id, this.channel_id)
        if(channel instanceof TextChannel){
            const message: Message | undefined = await channel.messages.fetch(this.message_id)
            if(message instanceof Message){
                const winners: string[] = await this.identifyWinners(message)
                const _message: string = this.getMessageURL()
                const winnersOfMentions: string[] = winners.map(winner => `<@${winner}>`)

                let description, content
                switch(winners.length){
                    case 0:
                        description = server.translate('structures.raffle.winners.none.description')
                        content = server.translate('structures.raffle.winners.none.content')
                        break

                    case 1:
                        description = `${server.translate('structures.raffle.winners.single.description')}: <@${winners.shift()}>`
                        content = server.translate('structures.raffle.winners.single.content', winnersOfMentions.join(', '), this.prize)
                        break

                    default:
                        description = `${server.translate('structures.raffle.winners.plural.description')}:\n${winnersOfMentions.join('\n')}`
                        content = server.translate('structures.raffle.winners.plural.content', winnersOfMentions.join(', '), this.prize)
                        break
                }

                const embed: MessageEmbed = new MessageEmbed()
                    .setAuthor(this.prize)
                    .setDescription(`${description}\n${server.translate('structures.raffle.creator')}: <@${this.constituent_id}>`)
                    .setFooter(`${server.translate('structures.raffle.footer.text', this.numbersOfWinner)} | ${server.translate('structures.raffle.footer.finish')}`)
                    .setTimestamp(new Date(this.finishAt))
                    .setColor('#36393F')

                await Promise.all([
                    message.edit(`${Constants.CONFETTI_REACTION_EMOJI} **${server.translate('structures.raffle.messages.finish')}** ${Constants.CONFETTI_REACTION_EMOJI}`, {
                        embed
                    }),
                    channel.send(`${Constants.CONFETTI_EMOJI} ${content}\n**${server.translate('structures.raffle.giveaway')}** ${_message}`)
                ])
            }
        }
    }

    public async identifyWinners(
        message: Message,
        numberOfWinners: number = this.numbersOfWinner
    ): Promise<string[]>{
        let winners = []

        if(message){
            const reaction: MessageReaction | undefined = await message.reactions.cache.get(Constants.CONFETTI_REACTION_EMOJI)
            const [_, users] = (await reaction.users.fetch()).partition(user => user.bot)
            const userKeys = users.keyArray().filter(user_id => user_id !== this.constituent_id)

            if(userKeys.length > numberOfWinners){
                const arrayRandom = new ArrayRandom(userKeys)
                arrayRandom.shuffle()
                winners.push(...arrayRandom.random(numberOfWinners))
            }else{
                winners.push(...userKeys)
            }
        }

        return winners
    }

    public getMessageURL(): string{
        return `https://discordapp.com/channels/${this.server_id}/${this.channel_id}/${this.message_id}`
    }

    public static getStartMessage(server: Server): string{
        return `${Constants.CONFETTI_EMOJI} **${server.translate('structures.raffle.messages.start')}** ${Constants.CONFETTI_EMOJI}`
    }

    public static getAlertMessage(server: Server): string{
        return `${Constants.CONFETTI_EMOJI} **${server.translate('structures.raffle.messages.alert')}** ${Constants.CONFETTI_EMOJI}`
    }

    public getEmbed(server: Server, alert: boolean = false, customRemainingTime: number = undefined): MessageEmbed{
        const finishAt: Date = this.finishAt
        const time = secondsToString(Math.ceil((finishAt.getTime() - this.createdAt.getTime()) / 1000), server.locale)
        const remaining = secondsToString(customRemainingTime ?? Math.ceil((finishAt.getTime() - Date.now()) / 1000), server.locale)

        return new MessageEmbed()
            .setAuthor(this.prize)
            .setDescription([
                server.translate('structures.raffle.join', Constants.CONFETTI_REACTION_EMOJI),
                `${server.translate('global.date-time.time')}: **${time}**`,
                `${server.translate('structures.raffle.to.end')}: **${remaining}**`,
                `${server.translate('structures.raffle.creator')}: <@${this.constituent_id}>`
            ])
            .setColor(alert ? 'RED' : '#bd087d')
            .setFooter(`${server.translate('structures.raffle.footer.text', this.numbersOfWinner)} | ${server.translate('structures.raffle.footer.continues')}`)
            .setTimestamp(finishAt)
    }

}

export default Raffle
