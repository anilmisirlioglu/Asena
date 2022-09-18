import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ColorResolvable,
    Colors,
    EmbedBuilder,
    Guild,
    GuildChannel,
    Message,
    MessageEditOptions,
    MessageOptions,
    MessageReaction,
    PermissionsBitField,
    Role,
    Snowflake,
    TextChannel
} from 'discord.js';
import Structure from './Structure';
import GiveawayModel, { IPartialServer, IGiveaway, GiveawayStatus, GiveawayVersion } from '../models/Giveaway';
import Timestamps from '../models/legacy/Timestamps';
import { secondsToString } from '../utils/DateTimeHelper';
import { Emojis, URLMap } from '../Constants';
import ID from '../models/legacy/ID';
import SuperClient from '../SuperClient';
import RandomArray from '../utils/RandomArray';
import LanguageManager from '../language/LanguageManager';
import { parseGiveawayTimerURL } from '../utils/Utils';
import { Actions } from '../interaction/actions/enums';

export type SuperGiveaway = IGiveaway & Timestamps & ID

class Giveaway extends Structure<typeof GiveawayModel, SuperGiveaway>{

    public prize: string
    public server_id: Snowflake
    public constituent_id: Snowflake
    public channel_id: Snowflake
    public message_id?: Snowflake
    public numberOfWinners: number
    public status: GiveawayStatus
    public finishAt: Date
    public allowedRoles: Snowflake[]
    public servers: IPartialServer[]
    public rewardRoles: Snowflake[]
    public color?: ColorResolvable
    public winners?: Snowflake[]
    public banner?: string
    public participants: Snowflake[]
    private __v: number

    private static locale: string

    constructor(data: SuperGiveaway, locale: string){
        super(GiveawayModel, data)

        Giveaway.locale = locale
    }

    protected patch(data: SuperGiveaway){
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
        this.banner = data.banner
        this.participants = data.participants ?? []
        this.__v = data.__v
    }

    protected identifierKey(): string{
        return 'message_id'
    }

    public isFinished(): boolean{
        return Date.now() > +this.finishAt
    }

    public isContinues(): boolean{
        return this.status === 'CONTINUES'
    }

    public async setStatus(status: GiveawayStatus){
        await this.update({ status })
    }

    public isCancelable(): boolean{
        return this.isContinues()
    }

    public async setCanceled(){
        await this.setStatus('CANCELED')
    }

    public isNewGenerationGiveaway(): boolean{
        return this.__v == GiveawayVersion.Interaction
    }

    public hasParticipant(user_id: Snowflake): boolean{
        return this.participants.includes(user_id)
    }

    public async participate(user_id: Snowflake): Promise<boolean>{
        const update = await this.model.findByIdAndUpdate(this.id, {
            $push: {
                participants: user_id
            }
        })

        if(update){
            this.participants.push(user_id)
            return true
        }

        return false
    }

    public async leave(user_id: Snowflake): Promise<boolean>{
        const update = await this.model.findByIdAndUpdate(this.id, {
            $pull: {
                participants: user_id
            }
        })

        if(update){
            const index = this.participants.indexOf(user_id)
            if(index > -1){
                this.participants.splice(index, 1)
            }

            return true
        }

        return false
    }

    private translate(key: string, ...args: Array<string | number>){
        return LanguageManager.translate(Giveaway.locale, key, ...args)
    }

    public async finish(client: SuperClient){
        await this.setStatus('FINISHED')

        const channel: GuildChannel | undefined = await client.fetchChannel(this.server_id, this.channel_id)
        if(channel instanceof TextChannel){
            const message: Message | undefined = await channel.messages.fetch(this.message_id)
            if(message instanceof Message){
                const winners: string[] = await (this.isNewGenerationGiveaway() ? this.determineWinners() : this.determineWinnersOnReactions(message))
                const winnersOfMentions: string[] = winners.map(winner => `<@${winner}>`)

                let description, content
                switch(winners.length){
                    case 0:
                        description = this.translate('structures.giveaway.winners.none.description')
                        content = this.translate('structures.giveaway.winners.none.content')
                        break

                    case 1:
                        description = `${this.translate('structures.giveaway.winners.single.description')}: <@${winners[0]}>`
                        content = this.translate('structures.giveaway.winners.single.content', winnersOfMentions.join(', '), this.prize)
                        break

                    default:
                        description = `${this.translate('structures.giveaway.winners.plural.description')}:\n${winnersOfMentions.map(winner => `:small_blue_diamond: ${winner}`).join('\n')}`
                        content = this.translate('structures.giveaway.winners.plural.content', winnersOfMentions.join(', '), this.prize)
                        break
                }

                const embed = new EmbedBuilder()
                    .setAuthor({ name: this.prize })
                    .setDescription([
                        `:medal: ${description}`,
                        `:reminder_ribbon: ${this.translate('structures.giveaway.embed.fields.creator')}: <@${this.constituent_id}>`
                    ].join('\n'))
                    .setFooter({ text: `${this.translate('structures.giveaway.embed.footer.text', this.numberOfWinners)} | ${this.translate('structures.giveaway.embed.footer.finish')}` })
                    .setTimestamp(new Date(this.finishAt))
                    .setColor('#36393F')

                await Promise.all([
                    message.edit({
                        content: `${Emojis.CONFETTI_REACTION_EMOJI} **${this.translate('structures.giveaway.messages.finish')}** ${Emojis.CONFETTI_REACTION_EMOJI}`,
                        embeds: [embed],
                        components: []
                    }),
                    message.reply(`${Emojis.CONFETTI_EMOJI} ${content}`),
                    this.resolveWinners(client, channel.guild, winners)
                ])
            }
        }
    }

    public async determineWinners(numberOfWinners: number = this.numberOfWinners): Promise<string[]>{
        const winners = []
        if(this.participants.length > numberOfWinners){
            const array = new RandomArray(this.participants)
            array.shuffle()
            winners.push(...array.random(numberOfWinners))
        }else{
            winners.push(...this.participants)
        }

        return winners
    }

    // This function will be removed in the future
    // just made for a while for backward compatibility
    public async determineWinnersOnReactions(message: Message, numberOfWinners: number = this.numberOfWinners): Promise<string[]>{
        const winners = []
        if(message){
            message = await message.fetch(true)

            let reaction: MessageReaction | undefined = await message.reactions.cache.get(Emojis.CONFETTI_REACTION_EMOJI)
            if(!reaction) return winners

            const [_, users] = (await reaction.users.fetch()).partition(user => user.bot)
            const userKeys = [...users.keys()].filter(user_id => user_id !== this.constituent_id)

            if(userKeys.length > numberOfWinners){
                const array = new RandomArray(userKeys)
                array.shuffle()
                winners.push(...array.random(numberOfWinners))
            }else{
                winners.push(...userKeys)
            }
        }

        return winners
    }

    public async resolveWinners(client: SuperClient, guild: Guild, winners: string[]){
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${this.translate('structures.giveaway.winner.embed.title')} 🏅` })
            .setDescription([
                `:gift: ${this.translate('structures.giveaway.winner.embed.fields.prize')}: **${this.prize}**`,
                `:star: ${this.translate('structures.giveaway.winner.embed.fields.server')}: **${guild.name}**`,
                `:link: **[${this.translate('structures.giveaway.winner.embed.fields.link')}](${this.messageURL})**`,
                `:rocket: **[${this.translate('global.vote')}](${URLMap.VOTE})** • **[${this.translate('structures.giveaway.winner.embed.fields.invite')}](${URLMap.INVITE})**`
            ].join('\n'))
            .setFooter({
                text: 'Powered by Asena',
                iconURL: guild.iconURL()
            })
            .setTimestamp()
            .setColor(Colors.Green)

        let rewardRoles: Role[] = []
        if(this.rewardRoles.length > 0 && guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)){
            const fetchRoles = await guild.roles.fetch()
            rewardRoles = [...fetchRoles.values()].filter(role =>
                this.rewardRoles.includes(role.id) &&
                role.comparePositionTo(guild.members.me.roles.highest) < 0
            )
        }

        const promises: Promise<unknown>[] = winners.map(winner => new Promise(() => {
            guild.members.fetch(winner).then(async user => {
                await Promise.all([
                    user.roles.add(rewardRoles),
                    user.send({ embeds: [embed] }).catch(_ => {})
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

    public get messageURL(): string{
        return `https://discord.com/channels/${this.server_id}/${this.channel_id}/${this.message_id}`
    }

    public static getStartMessage(): string{
        return `${Emojis.CONFETTI_EMOJI} **${LanguageManager.translate(this.locale, 'structures.giveaway.messages.start')}** ${Emojis.CONFETTI_EMOJI}`
    }

    public static getAlertMessage(): string{
        return `${Emojis.CONFETTI_EMOJI} **${LanguageManager.translate(this.locale, 'structures.giveaway.messages.alert')}** ${Emojis.CONFETTI_EMOJI}`
    }

    public buildEmbed(alert: boolean = false, rm: number = undefined): EmbedBuilder{
        const length = Math.ceil((+this.finishAt - +this.createdAt) / 1000)
        const time = secondsToString(length, Giveaway.locale)
        const remaining = secondsToString(rm ?? Math.ceil((+this.finishAt - Date.now()) / 1000), Giveaway.locale)

        const description = [
            `:star: ${this.translate('structures.giveaway.embed.fields.join', Emojis.CONFETTI_REACTION_EMOJI)}`,
            `:alarm_clock: ${this.translate('global.date-time.time')}: **${time}**`,
            `:calendar: ${this.translate('structures.giveaway.embed.fields.to.end')}: **${remaining}**`,
            `:reminder_ribbon: ${this.translate('structures.giveaway.embed.fields.creator')}: <@${this.constituent_id}>`,
            `:rocket: **[${this.translate('structures.giveaway.embed.fields.timer')}](${parseGiveawayTimerURL(this.createdAt, length)})** • **[${this.translate('global.vote')}](${URLMap.VOTE})**`
        ]
        if(this.isAdvancedEmbed){
            const roleToString = roles => roles.map(role => `<@&${role}>`).join(', ')
            const [checkOfRewardRoles, checkOfServers, checkOfAllowedRoles] = [
                this.rewardRoles.length === 0,
                this.servers.length === 0,
                this.allowedRoles.length === 0
            ]

            description.push(...[
                ' ',
                checkOfRewardRoles ? undefined : `:mega: ${this.translate('structures.giveaway.embed.fields.prize.roles')}: ${roleToString(this.rewardRoles)}`,
                checkOfServers ? undefined : `:mega: ${this.translate('structures.giveaway.embed.fields.should.servers')}: **${this.servers.map(server => `[${server.name}](${server.invite})`).join(', ')}**`,
                checkOfAllowedRoles ? undefined : `:mega: ${this.translate('structures.giveaway.embed.fields.should.roles')}: ${roleToString(this.allowedRoles)}`,
            ].filter(Boolean))
        }

        return new EmbedBuilder()
            .setAuthor({ name: this.prize })
            .setDescription(description.join('\n'))
            .setColor(alert ? Colors.Red : this.color ?? '#bd087d')
            .setTimestamp(this.finishAt)
            .setImage(this.banner)
            .setFooter({
                text: `${this.translate('structures.giveaway.embed.footer.text', this.numberOfWinners)} | ${this.translate('structures.giveaway.embed.footer.continues')}`
            })
    }

    private get isAdvancedEmbed(): boolean{
        return this.rewardRoles.length !== 0 ||
            this.servers.length !== 0 ||
            this.allowedRoles.length !== 0
    }

    public buildComponents(): ActionRowBuilder<ButtonBuilder>{
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`giveaway:${Actions.Giveaway.Join}`)
                    .setLabel(`(${this.participants.length || 0}) ${this.translate('global.join')}`)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎉')
            )
    }

    public getMessageOptions(): MessageOptions & MessageEditOptions{
        return {
            content: Giveaway.getStartMessage(),
            embeds: [this.buildEmbed()],
            components: [this.buildComponents()]
        }
    }

}

export default Giveaway
