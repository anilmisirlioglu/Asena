import { GuildChannel, Message, MessageEmbed, MessageReaction, TextChannel } from 'discord.js'

import { Constants } from '../Constants'
import { ArrayRandom } from '../array/ArrayRandom'
import Helper from './Helper'
import { DateTimeHelper } from './DateTimeHelper'
import { IRaffle } from '../models/Raffle';

export class RaffleHelper extends Helper{

    public async identifyWinners(raffle: IRaffle): Promise<string[]>{
        let winners = []

        const channel: GuildChannel | undefined = await this.client.helpers.channel.fetchChannel(raffle.server_id, raffle.channel_id)
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

    public getMessageURL(raffle: IRaffle): string{
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
                await this.client.managers.raffle.setRaffleMessageID(raffleId, $message.id)

                await $message.react(Constants.CONFETTI_REACTION_EMOJI)
            }else{
                await this.client.managers.raffle.deleteRaffle(raffleId)
            }
        })
    }

    public async finishRaffle(raffle: IRaffle){
        if(raffle){
            const channel: GuildChannel = await this.client.helpers.channel.fetchChannel(raffle.server_id, raffle.channel_id)
            if(channel instanceof TextChannel){
                const message: Message = await channel.messages.fetch(raffle.message_id)
                if(message){
                    const winners: string[] = await this.identifyWinners(raffle)
                    const _message: string = this.getMessageURL(raffle)
                    if(winners.length === 0){
                        await channel.send(`Yeterli katılım olmadığından dolayı çekilişin kazananı olmadı.\n**Çekiliş:** ${_message}`)
                    }else{
                        const winnersOfMentions: string[] = winners.map(winner => `<@${winner}>`)
                        const embed: MessageEmbed = new MessageEmbed()
                            .setAuthor(raffle.prize)
                            .setDescription(`${
                                winners.length === 1 ? `Kazanan: <@${winners.shift()}>` : `Kazananlar:\n${winnersOfMentions.join('\n')}`
                            }\nOluşturan: <@${raffle.constituent_id}>`)
                            .setFooter(`${raffle.numbersOfWinner} Kazanan | Sona Erdi`)
                            .setTimestamp(new Date(raffle.finishAt))
                            .setColor('#36393F')

                        await channel.send(`Tebrikler ${winnersOfMentions.join(', ')}! **${raffle.prize}** kazandınız\n**Çekiliş:** ${_message}`)
                        await channel.send(`${Constants.CONFETTI_EMOJI} **ÇEKİLİŞ BİTTİ** ${Constants.CONFETTI_EMOJI}`, {
                            embed
                        })
                    }
                }
            }
        }
    }

}