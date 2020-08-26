import Command from '../Command';
import Premium from '../../decorators/Premium';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Invite, Message } from 'discord.js';
import FlagValidator from '../../utils/FlagValidator';

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

        let message_id: string | undefined
        const matchContent = message.content.match(/(--raffle)[\x20\xA0]?(.*)/g)
        if(matchContent && matchContent.length !== 0){
            message_id = matchContent.shift().split(' ').pop().removeWhiteSpaces()
            if(!/^\d{17,19}$/g.test(message_id)){
                await message.channel.send({
                    embed: this.getErrorEmbed(`Geçersiz ID biçimi. Lütfen geçerli bir çekiliş ID 'si yazın.`)
                })

                return true
            }
        }

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

        const validator = new FlagValidator(client, message)
        switch(key){
            case 'renk':
            case 'color':
                const validateColor = await validator.validate('color', value)
                if(!validateColor.ok){
                    await message.channel.send(`<:red_tick:737035767150411889> ${validateColor.message}`)

                    return true
                }

                const color = validateColor.result

                await raffle.update({ color })
                await message.channel.send(`<:green_tick:737035767301275770> Çekiliş rengi başarıyla **${color}** olarak değiştirildi.`)
                break

            case 'ödül':
            case 'title':
            case 'prize':
                args.shift()
                let text = args.join(' ')
                if(message_id){
                    text = args.slice(0, args.length - 2).join(' ')
                }

                const validatePrize = await validator.validate('prize', text)
                if(!validatePrize.ok){
                    await message.channel.send(`<:red_tick:737035767150411889> ${validatePrize.message}`)

                    return true
                }

                await raffle.update({ prize: text })
                await message.channel.send(`<:green_tick:737035767301275770> Çekiliş ödülü/başlığı başarıyla **${text}** olarak değiştirildi.`)
                break

            default:
                return false
        }

        await fetch.edit({
            embed: raffle.getEmbed()
        })

        return true
    }

}

export default EditRaffle
