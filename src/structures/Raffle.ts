import {
    ColorResolvable,
    Guild,
    GuildChannel,
    Message,
    MessageEmbed,
    MessageReaction,
    Role,
    Snowflake,
    TextChannel
} from 'discord.js';
import Structure from './Structure';
import RaffleModel, { IPartialServer, IRaffle, RaffleStatus } from '../models/Raffle';
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
    public servers: IPartialServer[]
    public allowedRoles: Snowflake[]
    public rewardRoles: Snowflake[]
    public color?: ColorResolvable
    public winners?: Snowflake[]

    constructor(data: SuperRaffle){
        super(RaffleModel, data)
    }

    protected patch(data: SuperRaffle){
        if(typeof data.toObject === 'function'){
            data = data.toObject() // getting virtual props
        }

        this.prize = data.prize
        this.server_id = data.server_id
        this.constituent_id = data.constituent_id
        this.channel_id = data.channel_id
        this.server_id = data.server_id
        this.message_id = data.message_id
        this.numberOfWinners = data.numberOfWinners
        this.status = data.status
        this.finishAt = data.finishAt
        this.servers = data.servers ?? []
        this.allowedRoles = data.allowedRoles ?? []
        this.rewardRoles = data.rewardRoles ?? []
        this.color = data.color
        this.winners = data.winners ?? []
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
                        description = `Kazanan: <@${winners[0]}>`
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

                await Promise.all([
                    message.edit(`${Constants.CONFETTI_REACTION_EMOJI} **ÇEKİLİŞ BİTTİ** ${Constants.CONFETTI_REACTION_EMOJI}`, { embed }),
                    channel.send(`${content}\n**Çekiliş** ${_message}`),
                    this.resolveWinners(client, channel.guild, winners),
                ])
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

    public async resolveWinners(client: SuperClient, guild: Guild, winners: string[]){
        const me = guild.me
        const embed = new MessageEmbed()
            .setTitle(':medal: Tebrikler, bir çekiliş kazandınız! <a:ablobangel:744194706795266138>')
            .setDescription([
                `:gift: **${this.prize}**`,
                `:gem:  **${guild.name}**`,
                `:link: [Çekiliş Bağlantısı](${this.getMessageURL()})`,
                `:rocket: [Bana Oy Ver](https://top.gg/bot/716259870910840832/vote)`
            ])
            .setFooter(client.user.username, client.user.avatarURL())
            .setColor('GREEN')

        let rewardRoles: Role[] = []
        if(this.rewardRoles.length > 0 && me.hasPermission('MANAGE_ROLES')){
            const fetchRoles = await guild.roles.fetch()
            rewardRoles = fetchRoles
                .cache
                .array()
                .filter(role => this.rewardRoles.includes(role.id) && role.comparePositionTo(me.roles.highest) < 0)
        }

        const promises: Promise<unknown>[] = winners.map(winner => new Promise(() => {
            guild.members.fetch(winner).then(async user => {
                await Promise.all([
                    user.roles.add(rewardRoles),
                    user.send({ embed }).catch(_ => {})
                ])
            })
        }))

        await Promise.all([
            promises,
            new Promise(async () => {
                if(rewardRoles.length > 0){
                    await this.update({ winners }, false)
                    this.winners = winners
                }
            })
        ])
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

    public buildEmbed(alert: boolean = false, customRemainingTime: number = undefined): MessageEmbed{
        const finishAt: Date = this.finishAt
        const time = secondsToTime(Math.ceil((finishAt.getTime() - this.createdAt.getTime()) / 1000))
        const remaining = secondsToTime(customRemainingTime ?? Math.ceil((finishAt.getTime() - Date.now()) / 1000))
        const roleToString = roles => roles.map(role => `<@&${role}>`).join(', ')

        // This is not over yet

        const
            checkOfRewardRoles = this.rewardRoles.length === 0,
            checkOfServers = this.servers.length === 0,
            checkOfAllowedRoles = this.allowedRoles.length === 0
        return new MessageEmbed()
            .setAuthor(this.prize)
            .setDescription([
                `<:join_arrow:746358699706024047> Çekilişe Katılmak İçin ${Constants.CONFETTI_REACTION_EMOJI} emojisine tıklayın!`,
                ' ',
                `:stopwatch: Süre: **${time}**`,
                `:calendar: Bitmesine: **${remaining}**`,
                checkOfRewardRoles || checkOfServers || checkOfAllowedRoles ? ' ' : undefined,
                checkOfRewardRoles ? undefined : `:mega: Ödül olarak verilecek roller: ${roleToString(this.rewardRoles)}`,
                checkOfServers ? undefined : `:mega: Şu sunuculara üye olmalısınız: **${this.servers.map(server => `[${server.name}](${server.invite})`).join(', ')}**`,
                checkOfAllowedRoles ? undefined : `:mega: Şu rollere sahip olmalısınız: ${roleToString(this.allowedRoles)}`,
                ' ',
                `:round_pushpin: Oluşturan: <@${this.constituent_id}>`
            ].filter(Boolean))
            .setColor(alert ? 'RED' : this.color ?? '#bd087d')
            .setFooter(`${this.numberOfWinners} Kazanan | Bitiş`)
            .setTimestamp(finishAt)
    }

}

export default Raffle
