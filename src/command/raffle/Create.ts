import { CommandInteraction, MessageEmbed } from 'discord.js'
import Command, { Group } from '../Command'
import { RaffleLimits, Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import { RaffleStatus } from '../../models/Raffle';
import Server from '../../structures/Server';
import Raffle from '../../structures/Raffle';
import FlagValidator from '../../utils/FlagValidator';

export default class Create extends Command{

    constructor(){
        super({
            name: 'create',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.create.description',
            permission: 'ADMINISTRATOR',
            examples: [
                'winners: 1 time: 1h5m prize: Premium',
                'winners: 2 time: 1m prize: Discord Nitro',
                'winners: 3 time: 1m prize: Hello World color: GREEN',
                'winners: 4 time: 1h prize: Hello World servers: https://discord.gg/invite',
                'winners: 5 time: 5m prize: Hello World reward-roles: @Role,RoleID allowed-roles: @Role,RoleID',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<boolean>{
        // these flags are premium flags and required a premium to be used
        const nonRequiredFlags = {
            color: action.options.getString('color', false),
            servers: action.options.getString('servers', false),
            rewardRoles: action.options.getString('reward-roles', false),
            allowedRoles: action.options.getString('allowed-roles', false),
        }

        Object.keys(nonRequiredFlags).forEach(key => nonRequiredFlags[key] === null ? delete nonRequiredFlags[key] : {})
        if(Object.keys(nonRequiredFlags).length != 0){
            if(!server.isPremium()){
                const embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setDescription(server.translate('commands.handler.premium.only'))
                    .addField(`:star2:  ${server.translate('commands.handler.premium.try')}`, '<:join_arrow:746358699706024047> [Asena Premium](https://asena.xyz)')
                    .setColor('GREEN')

                await action.reply({ embeds: [embed] })
                return true
            }
        }

        const flags = {
            numberOfWinners: action.options.getInteger('winners', true),
            prize: action.options.getString('prize', true),
            time: action.options.getString('time', true),
        }

        const validator = new FlagValidator(client, action)
        for(const [key, value] of Object.entries({ ...nonRequiredFlags, ...flags })){
            if(value){
                const validate = await validator.validate(key, value)
                if(!validate.ok){
                    await action.reply({
                        embeds: [this.getErrorEmbed(server.translate(validate.message, ...validate.args))]
                    })

                    return true
                }

                flags[key] = validate.result
            }
        }

        const max = RaffleLimits[`MAX_COUNT${server.isPremium() ? '_PREMIUM' : ''}`]
        const raffles = await server.raffles.getContinues()
        if(raffles.length >= max){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.create.limits.max.created', max))]
            })

            return true
        }

        const finishAt: number = Date.now() + (Number(flags.time) * 1000)
        delete flags.time
        const data = {
            server_id: action.guild.id,
            constituent_id: action.user.id,
            channel_id: action.channel.id,
            status: 'CONTINUES' as RaffleStatus,
            finishAt: new Date(finishAt),
            message_id: null,
            ...flags
        }

        await action.deferReply({ ephemeral: true })

        const raffle = new Raffle(Object.assign({ createdAt: new Date() }, data) as any, server.locale)
        action.channel.send({
            content: Raffle.getStartMessage(),
            embeds: [raffle.buildEmbed()]
        }).then(async $message => {
            data.message_id = $message.id

            await server.raffles.create(data)

            await Promise.all([
                $message.react(Emojis.CONFETTI_REACTION_EMOJI),
                action.editReply({
                    content: server.translate('commands.raffle.create.successfully'),
                })
            ])
        }).catch(async () => {
            await action.editReply(':boom: ' + server.translate('commands.raffle.create.unauthorized'))
        })

        return true
    }

}
