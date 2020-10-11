import Factory from '../Factory';
import { Bot, Emojis } from '../Constants';
import { MessageReaction, PartialUser, User } from 'discord.js';
import CooldownService from '../services/CooldownService';
import Raffle from '../structures/Raffle';

export default class RaffleTimeUpdater extends Factory{

    private cooldownService: CooldownService = new CooldownService(Bot.COOLDOWN_TIME)

    public listenReactions(){
        this.client.on('messageReactionAdd', async (reaction: MessageReaction, user: User | PartialUser) => {
            if(reaction.message.partial){
                reaction.message = await reaction.message.fetch()
            }

            if(
                user.username !== this.client.user.username &&
                reaction.emoji.name === Emojis.CONFETTI_REACTION_EMOJI &&
                this.getCooldownService().checkCooldown(reaction.message.id)
            ){
                const server = await this.client.servers.get(reaction.message.guild.id)
                const raffle = await server.raffles.get(reaction.message.id)
                if(raffle && (raffle.status === 'CONTINUES' || raffle.status === 'ALMOST_DONE')){
                    let isOk = true
                    const servers = raffle.servers
                    if(servers.length > 0){
                        const fetchUserFromServers = servers.map(partial => {
                            const guild = this.client.guilds.cache.get(partial.id)
                            if(guild){
                                return guild.members.fetch(user.id).then(() => {
                                    return true
                                }).catch(() => {})
                            }

                            return undefined
                        })

                        const fetchServerResult = await Promise.all(fetchUserFromServers)
                        if(fetchServerResult.filter(Boolean).length !== servers.length){
                            isOk = false
                        }
                    }

                    const allowedRoles = raffle.allowedRoles
                    if(allowedRoles.length > 0){
                        const member = await reaction.message.guild.members.fetch(user.id)
                        const allowedRolesResult = allowedRoles.map(role_id => !!member.roles.cache.get(role_id))
                        if(allowedRolesResult.filter(item => item).length !== allowedRoles.length){
                            isOk = false
                        }
                    }

                    if(isOk){
                        const remaining = Math.ceil((raffle.finishAt.getTime() - Date.now()) / 1000)
                        if(remaining > 12){
                            this.getCooldownService().setCooldown(reaction.message.id)
                            await reaction.message.edit(Raffle.getStartMessage(), {
                                embed: raffle.buildEmbed()
                            })
                        }
                    }else{
                        await reaction.users.remove(user.id)
                    }
                }
            }
        })
    }

    public getCooldownService(): CooldownService{
        return this.cooldownService
    }

}
