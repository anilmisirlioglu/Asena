import { Client } from 'discord.js';

import { Constants } from '../Constants';
import { ArrayRandom } from '../array/ArrayRandom';
import { Helper } from "./Helper";

export class RaffleHelper<C extends Client> extends Helper<C>{

    public async identifyWinners(raffle): Promise<string[]>{
        let winners = []

        const channel = await this.getClient().helpers.channel.fetchChannel(raffle.server_id, raffle.channel_id)
        const message = await channel.messages.fetch(raffle.message_id)
        if(message){
            const reaction = await message.reactions.cache.get(Constants.CONFETTI_REACTION_EMOJI)
            const [_, users] = reaction.users.cache.partition(user => user.bot)
            const userKeys = users.keyArray().filter(user_id => user_id !== raffle.constituent_id)

            if(userKeys.length > raffle.numbersOfWinner){
                const arrayRandom = new ArrayRandom(userKeys)
                arrayRandom.shuffle()
                winners.push(...arrayRandom.random(raffle.numbersOfWinner))
            }else{
                winners.push(...userKeys)
            }
        }

        return winners
    }

    public getMessageURL(raffle): string{
        return `https://discordapp.com/channels/${raffle.server_id}/${raffle.channel_id}/${raffle.message_id}`
    }

}