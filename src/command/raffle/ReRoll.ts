import { CommandInteraction, Message } from 'discord.js'
import Command, { Group, Result } from '../Command'
import { Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class ReRoll extends Command{

    constructor(){
        super({
            name: 'reroll',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.reroll.description',
            permission: 'ADMINISTRATOR',
            examples: [
                '',
                'winners: 1',
                'message: 111111111111111111',
                'message: 111111111111111111 winners: 3',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<Result>{
        const message_id = action.options.getString('message', false)
        if(message_id && !this.isValidSnowflake(message_id)){
            return this.error('global.invalid.id')
        }

        const amount = action.options.getInteger('winners', false)
        if(amount && amount < 1){
            return this.error('commands.raffle.reroll.amount.min')
        }

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            return this.error('commands.raffle.reroll.not.found')
        }

        if(raffle.status !== 'FINISHED'){
            return this.error('commands.raffle.reroll.' + (raffle.status === 'CONTINUES' ? 'not.finish' : 'canceled'))
        }

        let fetch: Message | undefined = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if(!fetch){
            return this.error('commands.raffle.reroll.timeout')
        }

        if(!fetch.reactions){
            return this.error('commands.raffle.reroll.data.not.found')
        }

        if(amount && amount > raffle.numberOfWinners){
            return this.error('commands.raffle.reroll.amount.max', raffle.numberOfWinners)
        }

        await action.reply({
            content: server.translate('commands.raffle.reroll.successfully'),
            ephemeral: true
        })

        const winners = await (raffle.isNewGenerationGiveaway() ?
            raffle.determineWinners(amount || raffle.numberOfWinners) :
            raffle.determineWinnersOnReactions(fetch, amount || raffle.numberOfWinners)
        )
        if(winners.length === 0){
            await fetch.reply(server.translate('commands.raffle.reroll.not.enough'))
        }else{
            if(raffle.rewardRoles.length > 0 && !action.guild.me.permissions.has('MANAGE_ROLES')){
                return this.error('commands.raffle.reroll.unauthorized')
            }

            await Promise.all([
                fetch.reply(Emojis.CONFETTI_EMOJI + ' ' + server.translate('commands.raffle.reroll.congratulations', winners.map(winner => `<@${winner}>`).join(', '), raffle.prize)),
                new Promise(async () => {
                    if(raffle.winners.length > 0){
                        const promises: Promise<unknown>[] = raffle.winners.map(winner => new Promise(() => {
                            action.guild.members.fetch(winner).then(async user => {
                                if(user && raffle.rewardRoles.length > 0){
                                    await user.roles.remove(raffle.rewardRoles)
                                }
                            })
                        }))

                        await Promise.all(promises)
                    }
                }),
                raffle.resolveWinners(client, action.guild, winners)
            ])
        }

        return null
    }

}
