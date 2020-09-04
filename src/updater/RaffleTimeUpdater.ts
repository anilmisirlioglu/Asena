import Factory from '../Factory';
import Constants from '../Constants';
import { MessageReaction, PartialUser, User } from 'discord.js';
import CooldownService from '../services/CooldownService';
import Raffle from '../structures/Raffle';

export default class RaffleTimeUpdater extends Factory{

    private cooldownService: CooldownService = new CooldownService(Constants.COOLDOWN_TIME)

    public listenReactions(){
        this.client.on('messageReactionAdd', async (reaction: MessageReaction, user: User | PartialUser) => {
            if(reaction.message.partial){
                reaction.message = await reaction.message.fetch()
            }

            if(user.username !== this.client.user.username){
                if(reaction.emoji.name === Constants.CONFETTI_REACTION_EMOJI){
                    if(this.getCooldownService().checkCooldown(reaction.message.id)){
                        const server = await this.client.servers.get(reaction.message.guild.id)
                        const raffle = await server.raffles.get(reaction.message.id)
                        if(raffle && (raffle.status === 'CONTINUES' || raffle.status === 'ALMOST_DONE')){
                            const remaining = Math.ceil((raffle.finishAt.getTime() - Date.now()) / 1000)
                            if(remaining > 12){
                                this.getCooldownService().setCooldown(reaction.message.id)
                                await reaction.message.edit(Raffle.getStartMessage(), {
                                    embed: raffle.getEmbed()
                                })
                            }
                        }
                    }
                }
            }
        })
    }

    public getCooldownService(): CooldownService{
        return this.cooldownService
    }

}
