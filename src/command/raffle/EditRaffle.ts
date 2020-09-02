import Command from '../Command';
import Premium from '../../decorators/Premium';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Message } from 'discord.js';
import FlagValidator from '../../utils/FlagValidator';
import { RaffleLimits } from '../../Constants';
import { secondsToTime } from '../../utils/DateTimeHelper';

const RED_TICK = '<:red_tick:737035767150411889>'
const GREEN_TICK = '<:green_tick:737035767301275770>'

@Premium
class EditRaffle extends Command{

    constructor(){
        super({
            name: 'edit',
            aliases: ['düzenle', 'set'],
            description: 'Çekilişi düzenler.',
            usage: '[numberOfWinner|color|prize|time|rewardRoles] [...args]',
            permission: 'ADMINISTRATOR'
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const key = args.shift()
        const value = args[0]

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
        let updateQuery, success: string
        switch(key){
            case 'renk':
            case 'color':
                const validateColor = await validator.validate('color', value)
                if(!validateColor.ok){
                    await message.channel.send(RED_TICK + ' ' + validateColor.message)

                    return true
                }

                const color = validateColor.result

                updateQuery = { color }
                success = `Çekiliş rengi başarıyla **${color}** olarak değiştirildi.`
                break

            case 'ödül':
            case 'title':
            case 'prize':
                let text = args.join(' ')
                if(message_id){
                    text = args.slice(0, args.length - 2).join(' ')
                }

                const validatePrize = await validator.validate('prize', text)
                if(!validatePrize.ok){
                    await message.channel.send(RED_TICK + ' ' + validatePrize.message)

                    return true
                }

                updateQuery = {
                    prize: text
                }
                success = `Çekiliş ödülü/başlığı başarıyla **${text}** olarak değiştirildi.`
                break

            case 'ödülrol':
            case 'rewardRoles':
            case 'rewardRole':
                const mode = args.shift()
                if(mode !== '+' && mode !== '-'){
                    await message.channel.send(`${RED_TICK} Lütfen geçerli bir mod *(+ veya -)* girin. (**Örn:** ${server.prefix}edit rewardRoles + rol)`)

                    return true
                }

                let roles = args.join(' ')
                if(message_id){
                    roles = args.slice(0, args.length - 2).join(' ')
                }

                const validateRoles = await validator.validate('rewardRoles', roles)
                if(!validateRoles.ok){
                    await message.channel.send(RED_TICK + ' ' + validateRoles.message)

                    return true
                }

                const validatedRoles: string[] = validateRoles.result
                const rewardRoles = raffle.rewardRoles
                const evaluate = eval(`${rewardRoles.length} ${mode} ${validatedRoles.length}`)
                if((Number(evaluate) || 0) > RaffleLimits.MAX_REWARD_ROLE_COUNT){
                    await message.channel.send(`${RED_TICK} Ödül olarak maksimum ${RaffleLimits.MAX_REWARD_ROLE_COUNT} rol verebilirsiniz.`)

                    return true
                }

                const check = mode === '+'
                for(const role of validatedRoles){
                    const include = rewardRoles.includes(role)
                    if(check ? include : !include){
                        await message.channel.send(check ? `${RED_TICK} <@&${role}> zaten ödül olarak belirlenmiş bir rol.` : `${RED_TICK} Ödül olarak verilecek roller arasında <@&${role}> rolü bulunamadı.`)

                        return true
                    }
                }

                updateQuery = {
                    [check ? '$push' : '$pull']: {
                        rewardRoles: check ? validatedRoles : {
                            $in: validatedRoles
                        }
                    }
                }
                success = `Ödül olarak verilecek roller tekrardan düzenlendi. (${check ? 'Eklenen Roller' : 'Çıkarılan Roller'}: ${validatedRoles.map(role => `<@&${role}>`).join(', ')})`
                break

            case 'time':
            case 'zaman':
                const timeMode = args.shift()
                if(timeMode !== '+' && timeMode !== '-'){
                    await message.channel.send(`${RED_TICK} Lütfen geçerli bir mod *(+, - veya =)* girin. (**Örn:** ${server.prefix}edit time + 1m)`)

                    return true
                }

                if(Date.now() > +raffle.finishAt + (1000 * 60 * 2)){
                    await message.channel.send(`${RED_TICK} Çekilişin bitmesine 2 dakikadan az süre kalmış. Çekiliş süresini düzenleyebilmeniz için daha daha uzun bir süre gerekiyor.`)

                    return true
                }

                const time = args.shift()
                if(!time){
                    await message.channel.send(`${RED_TICK} Lütfen geçerli bir zaman girin.`)

                    return true
                }

                const validateTime = await validator.validate('time', time)
                if(!validateTime.ok){
                    await message.channel.send(RED_TICK + ' ' + validateTime.message)

                    return true
                }

                let finishAt = +raffle.finishAt, successText
                const result = validateTime.result * 1000 // second
                switch(timeMode){
                    case '-':
                        if(1000 * 2 * 60 > (finishAt - result) - Date.now()){
                            await message.channel.send(`${RED_TICK} Kısaltılan çekiliş süresi 2 dakikanın altına düşemez.`)

                            return true
                        }

                        finishAt = finishAt - result
                        successText = secondsToTime(result / 1000) + ' kısaltıldı.'
                        break

                    case '+':
                        if(Date.now() - (finishAt + result) > RaffleLimits.MAX_TIME){
                            await message.channel.send(`${RED_TICK} Uzatılan çekiliş süresi 60 günü geçemez.`)

                            return true
                        }

                        finishAt = finishAt + result
                        successText = secondsToTime(result / 1000) + ' uzatıldı.'
                        break
                }

                updateQuery = {
                    finishAt: new Date(finishAt)
                }
                success = `Çekiliş süresi başarıyla düzenlendi. **(Süre ${successText})**`
                break

            case 'kazanan':
            case 'numberOfWinners':
            case 'numberOfWinner':
            case 'winners':
                const validateNumber = await validator.validate('numberOfWinners', value)
                if(!validateNumber.ok){
                    await message.channel.send(RED_TICK + ' ' + validateNumber.message)

                    return true
                }

                updateQuery = {
                    numberOfWinners: validateNumber.result
                }
                success = `Kazanan sayısı başarıyla **${validateNumber.result}** olarak değiştirildi.`
                break

            default:
                return false
        }

        await Promise.all([
            raffle.update(updateQuery).then(async () => {
                await fetch.edit({
                    embed: raffle.getEmbed()
                })
            }),
            message.channel.send(GREEN_TICK + ' ' + success)
        ])

        return true
    }

}

export default EditRaffle
