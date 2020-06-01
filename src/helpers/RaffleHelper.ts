import { GuildChannel, Message, MessageEmbed, MessageReaction, TextChannel } from 'discord.js'

import { Constants } from '../Constants'
import { ArrayRandom } from '../array/ArrayRandom'
import { Helper, SuperClient } from './Helper'
import { DateTimeHelper } from './DateTimeHelper'
import call from '../utils/call'

export class RaffleHelper<C extends SuperClient> extends Helper<C>{

    public async identifyWinners(raffle): Promise<string[]>{
        let winners = []

        const channel: GuildChannel | undefined = await this.getClient().helpers.channel.fetchChannel(raffle.server_id, raffle.channel_id)
        if(channel && channel instanceof TextChannel){
            const message = await channel.messages.fetch(raffle.message_id)
            if(message){
                const reaction: MessageReaction | undefined = await message.reactions.cache.get(Constants.CONFETTI_REACTION_EMOJI)
                const [_, users] = (await reaction.users.fetch()).partition(user => user.bot)
                const userKeys = users.keyArray().filter(user_id => user_id !== raffle.constituent_id)

                if(userKeys.length > raffle.numbersOfWinner){
                    const arrayRandom = new ArrayRandom(userKeys)
                    arrayRandom.shuffle()
                    winners.push(...arrayRandom.random(raffle.numbersOfWinner))
                }else{
                    winners.push(...userKeys)
                }
            }
        }

        return winners
    }

    public getMessageURL(raffle): string{
        return `https://discordapp.com/channels/${raffle.server_id}/${raffle.channel_id}/${raffle.message_id}`
    }

    public async sendRaffleStartMessage(
        message: Message,
        channel: TextChannel,
        toSecond: number,
        stringToPrize: string,
        numbersOfWinner: number,
        finishAt: number,
        raffleId: string
    ){
        const secondsToTime = DateTimeHelper.secondsToTime(toSecond)
        const embedOfRaffle = new MessageEmbed()
            .setAuthor(stringToPrize)
            .setDescription(`Çekilişe katılmak için ${Constants.CONFETTI_REACTION_EMOJI} emojisine tıklayın!\nSüre: **${secondsToTime.toString()}**\nOluşturan: <@${message.author.id}>`)
            .setColor('#bd087d')
            .setFooter(`${numbersOfWinner} Kazanan | Bitiş`)
            .setTimestamp(new Date(finishAt))

        channel.send(`${Constants.CONFETTI_EMOJI} **ÇEKİLİŞ BAŞLADI** ${Constants.CONFETTI_EMOJI}`, {
            embed: embedOfRaffle
        }).then(async $message => {
            if($message){
                const SET_RAFFLE_MESSAGE_ID = `
                    mutation(
                        $raffle_id: ID!
                        $message_id: String!
                    ){
                        setRaffleMessageID(data: {
                            raffle_id: $raffle_id
                            message_id: $message_id
                        }){
                            errorCode
                        }
                    }
                `

                await call({
                    source: SET_RAFFLE_MESSAGE_ID,
                    variableValues: {
                        raffle_id: raffleId,
                        message_id: $message.id
                    }
                })

                await $message.react(Constants.CONFETTI_REACTION_EMOJI)
            }else{
                await this.deleteRaffle(raffleId)
            }
        })
    }

    public async deleteRaffle(raffle_id: string){
        const DELETE_RAFFLE = `
            mutation($raffle_id: ID!){
                deleteRaffle(data: {
                    raffle_id: $raffle_id
                }){
                    errorCode
                }
            }
         `

        await call({
            source: DELETE_RAFFLE,
            variableValues: {
                raffle_id
            }
        })
    }

}