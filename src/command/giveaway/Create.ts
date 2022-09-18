import { ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionsBitField } from 'discord.js'
import Command, { Group, Result } from '../Command'
import { GiveawayLimits } from '../../Constants'
import SuperClient from '../../SuperClient';
import { GiveawayStatus } from '../../models/Giveaway';
import Server from '../../structures/Server';
import Giveaway from '../../structures/Giveaway';
import FlagValidator from '../../utils/FlagValidator';

export default class Create extends Command{

    constructor(){
        super({
            name: 'create',
            group: Group.Giveaway,
            description: 'commands.giveaway.create.description',
            permission: PermissionsBitField.Flags.Administrator,
            examples: [
                'winners: 1 time: 1h5m prize: Premium',
                'winners: 2 time: 1m prize: Discord Nitro',
                'winners: 3 time: 1m prize: Hello World color: GREEN',
                'winners: 4 time: 1h prize: Hello World servers: https://discord.gg/invite',
                'winners: 5 time: 5m prize: Hello World reward-roles: @Role,RoleID allowed-roles: @Role,RoleID',
                'winners: 6 time: 5m prize: Hello World banner: https://image.com/image.png',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        // these flags are premium flags and required a premium to be used
        const nonRequiredFlags = {
            color: action.options.getString('color', false),
            servers: action.options.getString('servers', false),
            rewardRoles: action.options.getString('reward-roles', false),
            allowedRoles: action.options.getString('allowed-roles', false),
            banner: action.options.getString('banner', false)
        }

        Object.keys(nonRequiredFlags).forEach(key => nonRequiredFlags[key] === null ? delete nonRequiredFlags[key] : {})
        if(Object.keys(nonRequiredFlags).length != 0){
            if(!server.isPremium()){
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.avatarURL()
                    })
                    .setDescription(server.translate('commands.handler.premium.only'))
                    .setFields([
                        {
                            name: `:star2:  ${server.translate('commands.handler.premium.try')}`,
                            value: '<:join_arrow:746358699706024047> [Asena Premium](https://asena.xyz)'
                        }
                    ])
                    .setColor(Colors.Green)

                await action.reply({ embeds: [embed] })
                return null
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
                    return this.error(validate.message, ...validate.args)
                }

                flags[key] = validate.result
            }
        }

        const max = GiveawayLimits[`MAX_COUNT${server.isPremium() ? '_PREMIUM' : ''}`]
        const giveaways = await server.giveaways.getContinues()
        if(giveaways.length >= max){
            return this.error('commands.giveaway.create.limits.max.created', max)
        }

        const finishAt: number = Date.now() + (Number(flags.time) * 1000)
        delete flags.time
        const data = {
            server_id: action.guild.id,
            constituent_id: action.user.id,
            channel_id: action.channel.id,
            status: 'CONTINUES' as GiveawayStatus,
            finishAt: new Date(finishAt),
            message_id: null,
            ...flags
        }

        await action.deferReply({ ephemeral: true })

        const giveaway = new Giveaway(Object.assign({ createdAt: new Date() }, data) as any, server.locale)
        action.channel.send(giveaway.getMessageOptions()).then(async $message => {
            data.message_id = $message.id

            await server.giveaways.create(data)

            await action.editReply({
                content: server.translate('commands.giveaway.create.successfully')
            })
        }).catch(async () => {
            await action.editReply(':boom: ' + server.translate('commands.giveaway.create.unauthorized'))
        })

        return null
    }

}
