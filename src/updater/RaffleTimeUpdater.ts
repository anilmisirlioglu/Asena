import Factory from '../Factory';
import Constants from '../Constants';
import { MessageReaction, PartialUser, User } from 'discord.js';
import CooldownService from '../services/CooldownService';

export default class RaffleTimeUpdater extends Factory{

    private cooldownService: CooldownService = new CooldownService(Constants.COOLDOWN_TIME)

    public listenReactions(){
        this.client.on('messageReactionAdd', async (reaction: MessageReaction, user: User | PartialUser) => {
            if(reaction.message.partial){
                reaction.message = await reaction.message.fetch()
            }

            if(user.username !== this.getClient().user.username){
                if(reaction.emoji.name === Constants.CONFETTI_REACTION_EMOJI){
                    const raffle = await this.getClient().getRaffleManager().findContinuesRaffleByMessageId(reaction.message.id)
                    if(this.getCooldownService().checkCooldown(reaction.message.id)){
                        if(raffle){
                            const remaining = Math.ceil((raffle.finishAt.getTime() - Date.now()) / 1000)
                            if(remaining > 12){
                                this.getCooldownService().setCooldown(reaction.message.id)
                                await reaction.message.edit(this.getClient().getRaffleHelper().getRaffleMessage(), {
                                    embed: this.getClient().getRaffleHelper().getRaffleEmbed(raffle)
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