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
import { Emojis } from '../Constants';
import ID from '../models/legacy/ID';
import SuperClient from '../SuperClient';
import RandomArray from '../utils/RandomArray';
import LanguageManager from '../language/LanguageManager';

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

    private static locale: string

    constructor(data: SuperRaffle, locale: string){
        super(RaffleModel, data)

        Raffle.locale = locale
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

    private translate(key: string, ...args: Array<string | number>){
        return LanguageManager.translate(Raffle.locale, key, ...args)
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
                        description = this.translate('structures.raffle.winners.none.description')
                        content = this.translate('structures.raffle.winners.none.content')
                        break

                    case 1:
                        description = `${this.translate('structures.raffle.winners.single.description')}: <@${winners[0]}>`
                        content = this.translate('structures.raffle.winners.single.content', winnersOfMentions.join(', '), this.prize)
                        break

                    default:
                        description = `${this.translate('structures.raffle.winners.plural.description')}:\n${winnersOfMentions.join('\n')}`
                        content = this.translate('structures.raffle.winners.plural.content', winnersOfMentions.join(', '), this.prize)
                        break
                }

                const embed: MessageEmbed = new MessageEmbed()
                    .setAuthor(this.prize)
                    .setDescription(`${description}\n${this.translate('structures.raffle.creator')}: <@${this.constituent_id}>`)
                    .setFooter(`${this.translate('structures.raffle.footer.text', this.numberOfWinners)} | ${this.translate('structures.raffle.footer.finish')}`)
                    .setTimestamp(new Date(this.finishAt))
                    .setColor('#36393F')

                await Promise.all([
                    message.edit(`${Emojis.CONFETTI_REACTION_EMOJI} **${this.translate('structures.raffle.messages.finish')}** ${Emojis.CONFETTI_REACTION_EMOJI}`, {
                        embed
                    }),
                    channel.send(`${Emojis.CONFETTI_EMOJI} ${content}\n**${this.translate('structures.raffle.giveaway')}** ${_message}`),
                    this.resolveWinners(client, channel.guild, winners),
                ])
            }
        }
    }

    public async identifyWinners(message: Message): Promise<string[]>{
        let winners = []

        if(message){
            const reaction: MessageReaction | undefined = await message.reactions.cache.get(Emojis.CONFETTI_REACTION_EMOJI)
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
            .setTitle(`:medal: ${this.translate('structures.raffle.won')} <a:ablobangel:744194706795266138>`)
            .setDescription([
                `:gift: **${this.prize}**`,
                `:gem:  **${guild.name}**`,
                `:link: [${this.translate('structures.raffle.link')}](${this.getMessageURL()})`,
                `:rocket: [${this.translate('structures.raffle.vote')}](https://top.gg/bot/716259870910840832/vote)`
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
            async () => {
                if(rewardRoles.length > 0){
                    await this.update({ winners }, false)
                    this.winners = winners
                }
            }
        ])
    }

    public getMessageURL(): string{
        return `https://discordapp.com/channels/${this.server_id}/${this.channel_id}/${this.message_id}`
    }

    public static getStartMessage(): string{
        return `${Emojis.CONFETTI_EMOJI} **${LanguageManager.translate(this.locale, 'structures.raffle.messages.start')}** ${Emojis.CONFETTI_EMOJI}`
    }

    public static getAlertMessage(): string{
        return `${Emojis.CONFETTI_EMOJI} **${LanguageManager.translate(this.locale, 'structures.raffle.messages.alert')}** ${Emojis.CONFETTI_EMOJI}`
    }

    public buildEmbed(alert: boolean = false, rm: number = undefined): MessageEmbed{
        const finishAt: Date = this.finishAt
        const time = secondsToTime(Math.ceil((finishAt.getTime() - this.createdAt.getTime()) / 1000), Raffle.locale)
        const remaining = secondsToTime(rm ?? Math.ceil((finishAt.getTime() - Date.now()) / 1000), Raffle.locale)

        let description
        if(this.isNewEmbed){
            const roleToString = roles => roles.map(role => `<@&${role}>`).join(', ')
            const [checkOfRewardRoles, checkOfServers, checkOfAllowedRoles] = [
                this.rewardRoles.length === 0,
                this.rewardRoles.length === 0,
                this.allowedRoles.length === 0
            ]

            description = [
                `<:join_arrow:746358699706024047> ${this.translate('structures.raffle.join', Emojis.CONFETTI_REACTION_EMOJI)}`,
                ' ',
                `:stopwatch: ${this.translate('global.date-time.time')}: **${time}**`,
                `:calendar: ${this.translate('structures.raffle.to.end')}: **${remaining}**`,
                ' ',
                checkOfRewardRoles ? undefined : `:mega: ${this.translate('structures.raffle.prize.roles')}: ${roleToString(this.rewardRoles)}`,
                checkOfServers ? undefined : `:mega: ${this.translate('structures.raffle.should.servers')}: **${this.servers.map(server => `[${server.name}](${server.invite})`).join(', ')}**`,
                checkOfAllowedRoles ? undefined : `:mega: ${this.translate('structures.raffle.should.roles')}: ${roleToString(this.allowedRoles)}`,
                ' ',
                `:round_pushpin: ${this.translate('structures.raffle.creator')}: <@${this.constituent_id}>`
            ].filter(Boolean)
        }else{
            description = [
                this.translate('structures.raffle.join', Emojis.CONFETTI_REACTION_EMOJI),
                `${this.translate('global.date-time.time')}: **${time}**`,
                `${this.translate('structures.raffle.to.end')}: **${remaining}**`,
                `${this.translate('structures.raffle.creator')}: <@${this.constituent_id}>`
            ]
        }

        return new MessageEmbed()
            .setAuthor(this.prize)
            .setDescription(description)
            .setColor(alert ? 'RED' : this.color ?? '#bd087d')
            .setTimestamp(finishAt)
            .setFooter(`${this.translate('structures.raffle.footer.text', this.numberOfWinners)} | ${this.translate('structures.raffle.footer.finish')}`)
    }

    private get isNewEmbed(): boolean{
        return this.rewardRoles.length !== 0 ||
            this.servers.length !== 0 ||
            this.allowedRoles.length !== 0
    }

}

export default Raffle
