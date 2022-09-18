import { ChatInputCommandInteraction, Message, PermissionsBitField } from 'discord.js'
import Command, { Group, Result } from '../Command'
import { Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class ReRoll extends Command{

    constructor(){
        super({
            name: 'reroll',
            group: Group.Giveaway,
            description: 'commands.giveaway.reroll.description',
            permission: PermissionsBitField.Flags.Administrator,
            examples: [
                '',
                'winners: 1',
                'message: 111111111111111111',
                'message: 111111111111111111 winners: 3',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const message_id = action.options.getString('giveaway', false)
        if(message_id && !this.isValidSnowflake(message_id)){
            return this.error('global.invalid.id')
        }

        const amount = action.options.getInteger('winners', false)
        if(amount && amount < 1){
            return this.error('commands.giveaway.reroll.amount.min')
        }

        const giveaway = await (message_id ? server.giveaways.get(message_id) : server.giveaways.getLastCreated())
        if(!giveaway || !giveaway.message_id){
            return this.error('commands.giveaway.reroll.not.found')
        }

        if(giveaway.status !== 'FINISHED'){
            return this.error('commands.giveaway.reroll.' + (giveaway.status === 'CONTINUES' ? 'not.finish' : 'canceled'))
        }

        let fetch: Message | undefined = await client.fetchMessage(giveaway.server_id, giveaway.channel_id, giveaway.message_id)
        if(!fetch){
            return this.error('commands.giveaway.reroll.timeout')
        }

        if(!fetch.reactions){
            return this.error('commands.giveaway.reroll.data.not.found')
        }

        if(amount && amount > giveaway.numberOfWinners){
            return this.error('commands.giveaway.reroll.amount.max', giveaway.numberOfWinners)
        }

        await action.reply({
            content: server.translate('commands.giveaway.reroll.successfully'),
            ephemeral: true
        })

        const winners = await (giveaway.isNewGenerationGiveaway() ?
            giveaway.determineWinners(amount || giveaway.numberOfWinners) :
            giveaway.determineWinnersOnReactions(fetch, amount || giveaway.numberOfWinners)
        )
        if(winners.length === 0){
            await fetch.reply(server.translate('commands.giveaway.reroll.not.enough'))
        }else{
            if(giveaway.rewardRoles.length > 0 && !action.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)){
                return this.error('commands.giveaway.reroll.unauthorized')
            }

            await Promise.all([
                fetch.reply(Emojis.CONFETTI_EMOJI + ' ' + server.translate('commands.giveaway.reroll.congratulations', winners.map(winner => `<@${winner}>`).join(', '), giveaway.prize)),
                new Promise(async () => {
                    if(giveaway.winners.length > 0){
                        const promises: Promise<unknown>[] = giveaway.winners.map(winner => new Promise(() => {
                            action.guild.members.fetch(winner).then(async user => {
                                if(user && giveaway.rewardRoles.length > 0){
                                    await user.roles.remove(giveaway.rewardRoles)
                                }
                            })
                        }))

                        await Promise.all(promises)
                    }
                }),
                giveaway.resolveWinners(client, action.guild, winners)
            ])
        }

        return null
    }

}
