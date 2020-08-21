import { Invite, Message } from 'discord.js'

import Command from '../Command'
import Constants from '../../Constants'
import SuperClient from '../../SuperClient';
import { detectTime } from '../../utils/DateTimeHelper';
import { IRaffle, IRaffleCustomization } from '../../models/Raffle';
import Server from '../../structures/Server';
import Raffle from '../../structures/Raffle';

export default class CreateRaffle extends Command{

    private readonly flags: string[] = ['server']

    constructor(){
        super({
            name: 'create',
            aliases: ['çekilişoluştur', 'çekilişbaşlat', 'cekilisbaslat', 'createraffle'],
            description: 'Çekiliş oluşturur.',
            usage: '[kazanan sayısı<1 | 20>] [süre(1m | 5s) - [s(saniye) m(dakika) h(saat) d(gün)]] [ödül]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const numbersOfWinner: number = Number(args[0])
        const time: string = args[1]
        const prize: string[] = args.slice(2, args.length)

        if(isNaN(numbersOfWinner) || time === undefined || prize.length === 0){
            return false
        }

        if(numbersOfWinner > Constants.MAX_RAFFLE_WINNER || numbersOfWinner === 0){
            await message.channel.send({
                embed: this.getErrorEmbed('Çekilişi kazanan üye sayısı maksimum 25, minimum 1 kişi olabilir.')
            })

            return true
        }

        const stringToPrize: string = prize
            .filter(text => this.flags
                .filter(flag => text.startsWith(`-${flag}`))
                .length === 0
            )
            .join(' ')

        if(stringToPrize.length > 255){
            await message.channel.send({
                embed: this.getErrorEmbed('Çekiliş başlığı maksimum 255 karakter uzunluğunda olmalıdır.')
            })

            return true
        }

        const toSecond: number = detectTime(time);
        if(!toSecond){
            await message.channel.send({
                embed: this.getErrorEmbed('Lütfen geçerli bir süre giriniz. (Örn; **1s** - **1m** - **5m** - **1h** vb.)')
            })

            return true
        }

        if(toSecond < Constants.MIN_RAFFLE_TIME || toSecond > Constants.MAX_RAFFLE_TIME){
            await message.channel.send({
                embed: this.getErrorEmbed('Çekiliş süresi en az 1 dakika, en fazla 60 gün olabilir.')
            })

            return true
        }

        const raffles = await server.raffles.getContinues()
        if(raffles.length > 5){
            await message.channel.send({
                embed: this.getErrorEmbed('Maksimum çekiliş oluşturma sınırına ulaşmışsınız. (Max: 5)')
            })

            return true
        }

        let customization: IRaffleCustomization | null = {
            server_id: null
        }

        if(server.isPremium()){
            if(message.content.includes('-server')){
                const matchInvite = message.content.match(/(https?:\/\/)?(www\.)?(discord\.gg|discordapp\.com\/invite)\/.?(?:[a-zA-Z0-9\-]{2,32})/g)
                if(!matchInvite || matchInvite.length === 0){
                    await message.channel.send({
                        embed: this.getErrorEmbed('Lütfen geçerli bir sunucu davet bağlantısı girin.')
                    })

                    return true
                }

                const fetchInvite: Invite | null = await new Promise(resolve => {
                    client.fetchInvite(matchInvite.shift()).then(resolve).catch(() => {
                        resolve(null)
                    })
                })

                if(!fetchInvite){
                    await message.channel.send({
                        embed: this.getErrorEmbed('Geçersiz davet bağlantısı.')
                    })

                    return true
                }

                const target = client.guilds.cache.get(fetchInvite.guild.id)
                if(!target){
                    await message.channel.send({
                        embed: this.getErrorEmbed(`**${client.user.username}** katılım zorunluluğu olan sunucuda bulunmak zorundadır. Lütfen davet bağlantısını girdiğiniz sunucuya **${client.user.username}** \'yı ekleyin.`)
                    })

                    return true
                }

                customization.server_id = target.id
            }
        }else{
            const filter = this.flags.filter(flag => message.content.includes(`-${flag}`))
            if(filter.length > 0){
                await message.channel.send({
                    embed: this.getPremiumEmbed()
                })

                return true
            }

            customization = null
        }

        const finishAt: number = Date.now() + (toSecond * 1000)
        const data = {
            prize: stringToPrize,
            server_id: message.guild.id,
            constituent_id: message.author.id,
            channel_id: message.channel.id,
            numbersOfWinner,
            status: 'CONTINUES',
            finishAt: new Date(finishAt),
            customization
        }

        const raffle = new Raffle(Object.assign({
            createdAt: new Date()
        }, data as IRaffle))

        message.channel.send(Raffle.getStartMessage(), {
            embed: raffle.getEmbed()
        }).then(async $message => {
            await $message.react(Constants.CONFETTI_REACTION_EMOJI)

            await server.raffles.create(Object.assign({
                message_id: $message.id
            }, data) as IRaffle)
        }).catch(async () => {
            await message.channel.send(':boom: Botun yetkileri, bu kanalda çekiliş oluşturmak için yetersiz olduğu için çekiliş başlatılamadı.')
        })

        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 0
            })
        }

        return true
    }

}
