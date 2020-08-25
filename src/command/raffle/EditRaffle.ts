import Command from '../Command';
import Premium from '../../decorators/Premium';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Invite, Message } from 'discord.js';

@Premium
class EditRaffle extends Command{

    constructor(){
        super({
            name: 'edit',
            aliases: ['düzenle', 'set'],
            description: 'Çekilişi düzenler.',
            usage: 'TODO',
            permission: 'ADMINISTRATOR'
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const key = args[0]
        const value = args[1]

        if(!key || !value) return false

        let message_id: string | undefined = args[2]
        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await message.channel.send({
                embed: this.getErrorEmbed(`Düzenlenebilecek bir çekiliş bulunamadı.`)
            })

            return true
        }

        if(!raffle.isContinues()){
            await message.channel.send({
                embed: this.getErrorEmbed('Anlaşılan bu çekiliş zaten bitmiş veya iptal edilmiş. (Yalnızca devam eden çekilişleri düzenleyebilirsiniz.)')
            })

            return true
        }

        const fetch = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if(!fetch){
            await message.channel.send({
                embed: this.getErrorEmbed('Anlaşılan bu çekiliş mesajı silinmiş veya zaman aşımına uğramış.')
            })

            return true
        }

        switch(key){
            case 'sunucu':
            case 'server':
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

                const target = client.guilds.cache.get(fetchInvite.guild?.id)
                if(!target){
                    await message.channel.send({
                        embed: this.getErrorEmbed(`**${client.user.username}** katılım zorunluluğu olan sunucuda bulunmak zorundadır. Lütfen davet bağlantısını girdiğiniz sunucuya **${client.user.username}** \'yı ekleyin.`)
                    })

                    return true
                }

                if(target.id === message.guild.id){
                    await message.channel.send({
                        embed: this.getErrorEmbed('Çekilişi başlattığınız sunucuyu katılım zorunluluğu olan sunucu olarak belirleyemezsiniz.')
                    })

                    return true
                }

                /*if(raffle.customization?.server_id === target.id){
                    await message.channel.send({
                        embed: this.getErrorEmbed('Girdiğiniz sunucu zaten şu anda katılım zorunluluğu olan sunucu.')
                    })

                    return true
                }

                await raffle.setServer(target.id)*/
                await message.channel.send(`<:green_tick:737035767301275770> Katılma zorunluluğu olan sunucu başarıyla **${target.name}** olarak değiştirildi.`)

                return true

            case 'renk':
            case 'color':
                const matchColor = value.match(/#?(?:[0-9a-fA-F]{3}){1,2}|(RED|WHITE|AQUA|GREEN|BLUE|YELLOW|PURPLE|LUMINOUS_VIVID_PINK|GOLD|ORANGE|GREY|NAVY|RANDOM|DARKER_GREY|DARK_AQUA|DARK_GREEN|DARK_BLUE|DARK_PURPLE|DARK_VIVID_PINK|DARK_GOLD|DARK_ORANGE|DARK_RED|DARK_GREY|LIGHT_GREY|DARK_NAVY)/g)
                if(!matchColor || matchColor.length === 0){
                    await message.channel.send({
                        embed: this.getErrorEmbed('Lütfen geçerli bir renk girin. (Hexadecimal renk kodu veya renk.)')
                    })

                    return true
                }

                const color = matchColor.shift()

                //await raffle.setColor(color)
                await fetch.edit({
                    embed: raffle.getEmbed()
                })

                await message.channel.send(`<:green_tick:737035767301275770> Çekiliş rengi başarıyla **${color}** olarak değiştirildi.`)

                return true

            default:
                return false
        }
    }

}

export default EditRaffle
