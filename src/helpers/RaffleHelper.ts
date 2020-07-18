import { GuildChannel, Message, MessageEmbed, MessageReaction, TextChannel } from 'discord.js'

import Constants from '../Constants'
import ArrayRandom from '../array/ArrayRandom'
import { DateTimeHelper } from './DateTimeHelper'
import { IRaffle } from '../models/Raffle';
import Timestamps from '../models/legacy/Timestamps';
import Factory from '../Factory';

export default class RaffleHelper extends Factory{

    public async identifyWinners(raffle: IRaffle): Promise<string[]>{
        let winners = []

        const channel: GuildChannel | undefined = await this.client.fetchChannel(raffle.server_id, raffle.channel_id)
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

    public getRaffleEmbed(raffle: IRaffle & Timestamps, alert: boolean = false, customRemainingTime: number = undefined): MessageEmbed{
        const finishAt: Date = raffle.finishAt
        const time = DateTimeHelper.secondsToTime(Math.ceil((finishAt.getTime() - raffle.createdAt.getTime()) / 1000))
        const remaining = DateTimeHelper.secondsToTime(customRemainingTime ?? Math.ceil((finishAt.getTime() - Date.now()) / 1000))

        return new MessageEmbed()
            .setAuthor(raffle.prize)
            .setDescription(
                [
                    `Çekilişe Katılmak İçin ${Constants.CONFETTI_REACTION_EMOJI} emojisine tıklayın!`,
                    `Süre: **${time}**`,
                    `Bitmesine: **${remaining}**`,
                    `Oluşturan: <@${raffle.constituent_id}>`
                ].join('\n')
            )
            .setColor(alert ? 'RED' : '#bd087d')
            .setFooter(`${raffle.numbersOfWinner} Kazanan | Bitiş`)
            .setTimestamp(finishAt)
    }

    public getRaffleMessage(): string{
        return `${Constants.CONFETTI_EMOJI} **ÇEKİLİŞ BAŞLADI** ${Constants.CONFETTI_EMOJI}`
    }

    public getRaffleAlertMessage(): string{
        return `${Constants.CONFETTI_EMOJI} **ÇEKİLİŞ İÇİN SON KATILIM** ${Constants.CONFETTI_EMOJI}`
    }

    public async sendRaffleStartMessage(
        message: Message,
        channel: TextChannel,
        raffle: IRaffle
    ){
        channel
            .send(this.getRaffleMessage(), {
                embed: this.getRaffleEmbed(raffle)
            })
            .then(async $message => {
                await this.client.getRaffleManager().setRaffleMessageID(raffle.id, $message.id)

                await $message.react(Constants.CONFETTI_REACTION_EMOJI)
            })
            .catch(async () => {
                await this.client.getRaffleManager().deleteRaffle(raffle.id)

                await message.channel.send(':boom: Botun yetkileri, bu kanalda çekiliş oluşturmak için yetersiz olduğu için çekiliş başlatılamadı.')
            })
    }

    public async finishRaffle(raffle: IRaffle){
        const channel: GuildChannel | undefined = await this.client.fetchChannel(raffle.server_id, raffle.channel_id)
        if(channel instanceof TextChannel){
            const message: Message | undefined = await channel.messages.fetch(raffle.message_id)
            if(message instanceof Message){
                const winners: string[] = await this.identifyWinners(raffle)
                const _message: string = this.getMessageURL(raffle)
                const winnersOfMentions: string[] = winners.map(winner => `<@${winner}>`)

                let description, content
                switch(winners.length){
                    case 0:
                        description = 'Yetersiz katılım. Kazanan olmadı.'
                        content = 'Yeterli katılım olmadığından dolayı çekilişin kazananı olmadı.'
                        break

                    case 1:
                        description = `Kazanan: <@${winners.shift()}>`
                        content = `Tebrikler ${winnersOfMentions.join(', ')}! **${raffle.prize}** kazandınız`
                        break

                    default:
                        description = `Kazananlar:\n${winnersOfMentions.join('\n')}`
                        content = `Tebrikler ${winnersOfMentions.join(', ')}! **${raffle.prize}** kazandınız`
                        break
                }

                const embed: MessageEmbed = new MessageEmbed()
                    .setAuthor(raffle.prize)
                    .setDescription(`${description}\nOluşturan: <@${raffle.constituent_id}>`)
                    .setFooter(`${raffle.numbersOfWinner} Kazanan | Sona Erdi`)
                    .setTimestamp(new Date(raffle.finishAt))
                    .setColor('#36393F')

                await message.edit(`${Constants.CONFETTI_REACTION_EMOJI} **ÇEKİLİŞ BİTTİ** ${Constants.CONFETTI_REACTION_EMOJI}`, {
                    embed
                })
                await channel.send(`${content}\n**Çekiliş** ${_message}`)
            }
        }
    }

}