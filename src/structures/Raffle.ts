import {
    ColorResolvable,
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
import { secondsToTime } from '../utils/DateTimeHelper';
import Constants from '../Constants';
import ID from '../models/legacy/ID';
import SuperClient from '../SuperClient';
import RandomArray from '../utils/RandomArray';

type SuperRaffle = IRaffle & Timestamps & ID

class Raffle extends Structure<typeof RaffleModel, SuperRaffle>{

    public prize: string
    public server_id: Snowflake
    public constituent_id: Snowflake
    public channel_id: Snowflake
    public message_id?: Snowflake
    public numberOfWinners: number
    public status: RaffleStatus
    public finishAt: Date
    public servers?: Snowflake[]
    public allowedRoles?: Snowflake[]
    public rewardRoles?: Snowflake[]
    public color?: ColorResolvable

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
        this.numberOfWinners = data.numberOfWinners
        this.status = data.status
        this.finishAt = data.finishAt
        this.servers = data.servers
        this.allowedRoles = data.allowedRoles
        this.rewardRoles = data.rewardRoles
        this.color = data.color
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

    public async finish(client: SuperClient){
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
                        description = 'Yetersiz katılım. Kazanan olmadı.'
                        content = 'Yeterli katılım olmadığından dolayı çekilişin kazananı olmadı.'
                        break

                    case 1:
                        description = `Kazanan: <@${winners.shift()}>`
                        content = `Tebrikler ${winnersOfMentions.join(', ')}! **${this.prize}** kazandınız`
                        break

                    default:
                        description = `Kazananlar:\n${winnersOfMentions.join('\n')}`
                        content = `Tebrikler ${winnersOfMentions.join(', ')}! **${this.prize}** kazandınız`
                        break
                }

                const embed: MessageEmbed = new MessageEmbed()
                    .setAuthor(this.prize)
                    .setDescription(`${description}\nOluşturan: <@${this.constituent_id}>`)
                    .setFooter(`${this.numberOfWinners} Kazanan | Sona Erdi`)
                    .setTimestamp(new Date(this.finishAt))
                    .setColor('#36393F')

                await message.edit(`${Constants.CONFETTI_REACTION_EMOJI} **ÇEKİLİŞ BİTTİ** ${Constants.CONFETTI_REACTION_EMOJI}`, {
                    embed
                })
                await channel.send(`${content}\n**Çekiliş** ${_message}`)
            }
        }
    }

    public async identifyWinners(message: Message): Promise<string[]>{
        let winners = []

        if(message){
            const reaction: MessageReaction | undefined = await message.reactions.cache.get(Constants.CONFETTI_REACTION_EMOJI)
            const [_, users] = (await reaction.users.fetch()).partition(user => user.bot)
            const userKeys = users.keyArray().filter(user_id => user_id !== this.constituent_id)

            if(userKeys.length > this.numberOfWinners){
                const randomArray = new RandomArray(userKeys)
                randomArray.shuffle()
                winners.push(...randomArray.random(this.numberOfWinners))
            }else{
                winners.push(...userKeys)
            }
        }

        return winners
    }

    public getMessageURL(): string{
        return `https://discordapp.com/channels/${this.server_id}/${this.channel_id}/${this.message_id}`
    }

    public static getStartMessage(): string{
        return `${Constants.CONFETTI_EMOJI} **ÇEKİLİŞ BAŞLADI** ${Constants.CONFETTI_EMOJI}`
    }

    public static getAlertMessage(): string{
        return `${Constants.CONFETTI_EMOJI} **ÇEKİLİŞ İÇİN SON KATILIM** ${Constants.CONFETTI_EMOJI}`
    }

    public getEmbed(alert: boolean = false, customRemainingTime: number = undefined): MessageEmbed{
        const finishAt: Date = this.finishAt
        const time = secondsToTime(Math.ceil((finishAt.getTime() - this.createdAt.getTime()) / 1000))
        const remaining = secondsToTime(customRemainingTime ?? Math.ceil((finishAt.getTime() - Date.now()) / 1000))

        return new MessageEmbed()
            .setAuthor(this.prize)
            .setDescription([
                `Çekilişe Katılmak İçin ${Constants.CONFETTI_REACTION_EMOJI} emojisine tıklayın!`,
                `Süre: **${time}**`,
                `Bitmesine: **${remaining}**`,
                `Oluşturan: <@${this.constituent_id}>`
            ].join('\n'))
            .setColor(alert ? 'RED' : this.color ?? '#bd087d')
            .setFooter(`${this.numberOfWinners} Kazanan | Bitiş`)
            .setTimestamp(finishAt)
    }

}

export default Raffle
