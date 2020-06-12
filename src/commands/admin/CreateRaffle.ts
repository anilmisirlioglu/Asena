import { Message, TextChannel } from 'discord.js'

import { Command } from '../Command'
import { Constants } from '../../Constants'
import call from '../../utils/call'
import { SuperClient } from '../../Asena';

export class CreateRaffle extends Command{

    constructor(){
        super({
            name: 'create',
            aliases: ['çekilişoluştur', 'çekilişbaşlat', 'cekilisbaslat', 'createraffle'],
            description: 'Çekiliş oluşturur.',
            usage: '[kazanan sayısı<1 | 20>] [süre] [süre tipi<m(dakika) | h(saat) | d(gün)>] [ödül]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const numbersOfWinner: number = Number(args[0])
        const time: number = Number(args[1])
        const timeType: string = args[2] as string
        const prize: string[] = args.slice(3, args.length)

        if(isNaN(numbersOfWinner) || isNaN(time) || Constants.ALLOWED_TIME_TYPES.indexOf(timeType) === -1 || prize.length === 0){
            return Promise.resolve(false);
        }

        if(numbersOfWinner > Constants.MAX_WINNER || numbersOfWinner === 0){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Çekilişi kazanan üye sayısı maksimum 25, minimum 1 kişi olabilir.')
            })

            return Promise.resolve(true)
        }

        const stringToPrize: string = prize.join(' ')
        if(stringToPrize.length > 255){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Çekiliş başlığı maksimum 255 karakter uzunluğunda olmalıdır.')
            })

            return Promise.resolve(true)
        }

        let toSecond: number = 0;
        switch(timeType){
            case 'm':
            case 'dakika':
            case 'minute':
                toSecond = 60 * time
                break;

            case 'h':
            case 'saat':
            case 'hour':
                toSecond = 60 * 60 * time
                break;

            case 'd':
            case 'gün':
            case 'day':
                toSecond = ((60 * 60) * 24) * time
                break;
        }

        if(toSecond < Constants.MIN_TIME || toSecond > Constants.MAX_TIME){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Çekiliş süresi en az 1 dakika, en fazla 60 gün olabilir.')
            })

            return Promise.resolve(true)
        }

        const CREATE_RAFFLE = `
            mutation(
                $prize: String!
                $server_id: String!
                $constituent_id: String!
                $channel_id: String!
                $numbersOfWinner: Int!
                $finishAt: Date!
            ){
                createRaffle(data: {
                    prize: $prize
                    server_id: $server_id
                    constituent_id: $constituent_id
                    channel_id: $channel_id
                    numbersOfWinner: $numbersOfWinner
                    finishAt: $finishAt
                }){
                    raffle{
                        id
                    }
                    errorCode
                }
            }
        `;

        const finishAt: number = Date.now() + (toSecond * 1000)
        const result = await call({
            source: CREATE_RAFFLE,
            variableValues: {
                prize: stringToPrize,
                server_id: message.guild.id,
                constituent_id: message.author.id,
                channel_id: message.channel.id,
                numbersOfWinner,
                finishAt: finishAt
            }
        });

        const createRaffle = result.data.createRaffle;
        if(createRaffle.errorCode === 0x225){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Maksimum çekiliş oluşturma sınırına ulaşmışsınız. (Max: 5)')
            })

            return Promise.resolve(true)
        }

        await client.helpers.raffle.sendRaffleStartMessage(
            message,
            message.channel as TextChannel,
            toSecond,
            stringToPrize,
            numbersOfWinner,
            finishAt,
            createRaffle.raffle.id
        )

        /*const $secondsToTime = DateTimeHelper.secondsToTime(toSecond)
        const timeString: string = (() => {
            let arr = [];
            if($secondsToTime.d !== 0){
                arr.push(`${$secondsToTime.d} gün`)
            }

            if($secondsToTime.h !== 0){
                arr.push(`${$secondsToTime.h} saat`)
            }

            if($secondsToTime.m !== 0){
                arr.push(`${$secondsToTime.m} dakika`)
            }

            return arr.join(', ')
        })()

        const embedOfRaffle = new MessageEmbed()
            .setAuthor(stringToPrize)
            .setDescription(`Çekilişe katılmak için ${Constants.CONFETTI_REACTION_EMOJI} emojisine tıklayın!\nSüre: **${timeString}**\nOluşturan: <@${message.author.id}>`)
            .setColor('#bd087d')
            .setFooter(`${numbersOfWinner} Kazanan | Bitiş`)
            .setTimestamp(new Date(finishAt))

        message.channel.send(`${Constants.CONFETTI_EMOJI} **ÇEKİLİŞ BAŞLADI** ${Constants.CONFETTI_EMOJI}`, {
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
                        raffle_id: createRaffle.raffle.id,
                        message_id: $message.id
                    }
                })

                await $message.react(Constants.CONFETTI_REACTION_EMOJI)
            }else{
                const DELETE_RAFFLE = `
                    mutation(
                        $raffle_id: ID!
                    ){
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
                        raffle_id: createRaffle.raffle.id
                    }
                })
            }
        })*/

        await message.delete({
            timeout: 0
        })

        return Promise.resolve(true)
    }

}