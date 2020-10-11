import Command from '../Command'
import { secondsToTime, detectTime } from '../../utils/DateTimeHelper'
import { Message, TextChannel } from 'discord.js'
import Constants, { RaffleLimits } from '../../Constants'
import InteractiveSetup from '../../setup/InteractiveSetup'
import SetupPhase from '../../setup/SetupPhase'
import SuperClient from '../../SuperClient'
import { IRaffle } from '../../models/Raffle'
import Server from '../../structures/Server'
import Raffle from '../../structures/Raffle'
import FlagValidator, { Flags } from '../../utils/FlagValidator';

export default class SetupRaffle extends Command{

    constructor(){
        super({
            name: 'setup',
            aliases: ['sihirbaz'],
            description: 'Çekiliş kurulum sihirbazını başlatır.',
            usage: null,
            permission: 'ADMINISTRATOR'
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        if(message.channel instanceof TextChannel){
            if(client.getSetupManager().inSetup(message.author.id)){
                await message.channel.send({
                    embed: this.getErrorEmbed('Zaten bir kurulum sihirbazı içindesin. Lütfen önce başlattığınız kurulumu bitirin veya iptal edin.')
                })

                return true
            }

            const max = RaffleLimits[`MAX_COUNT${server.isPremium() ? '_PREMIUM' : ''}`]
            const result = await server.raffles.getContinues()
            if(result.length >= max){
                await message.channel.send({
                    embed: this.getErrorEmbed(`Maksimum çekiliş oluşturma sınırı aşıyorsunuz. (Maks ${max})`)
                })

                return true
            }

            const phases = [
                new SetupPhase({
                    message: [
                        `${Constants.CONFETTI_REACTION_EMOJI} ${client.user.username} interaktif kurulum sihirbazına **hoşgeldiniz**!`,
                        'Eğer sihirbazdan **çıkmak** isterseniz lütfen sohbete `iptal`, `cancel` veya `exit` yazın. Hadi kuruluma geçelim.\n',
                        '**Adım 1:** Öncelikle çekilişin hangi metin kanalında yapılacağını belirleyelim\n',
                        '`Lütfen sunucuda var olan botun erişebileceği bir metin kanalını etiketlemeniz gerektiğini unutmayın.`'
                    ],
                    validator: async (message: Message) => {
                        const channels = message.mentions.channels
                        if(channels.size === 0){
                            await message.channel.send(':boom: Lütfen bir metin kanalı etiketleyin.')
                            return {
                                result: false,
                                value: null
                            }
                        }

                        const channel = channels.first()
                        if(!(channel instanceof TextChannel)){
                            await message.channel.send(':boom: Lütfen geçerli bir metin kanalı etiketleyin.')
                            return {
                                result: false,
                                value: null
                            }
                        }

                        await message.channel.send(`${Constants.CONFETTI_REACTION_EMOJI} Başarılı! Çekiliş kanalı <#${channel.id}> olarak belirlendi. Hadi sıradaki aşamaya geçelim.`)
                        return {
                            result: true,
                            value: channel.id
                        }
                    },
                    skippable: false
                }),
                new SetupPhase({
                    message: [
                        '**Adım 2:** Kaç kazanan olucağını belirleyelim\n',
                        '`Lütfen sayısal ve 1 ila 20 aralığında bir sayı girmeniz gerektiğini unutmayın.`'
                    ],
                    validator: async (message: Message) => {
                        const toInt: number = Number(message.content.trim())
                        if(isNaN(toInt)){
                            await message.channel.send(':boom: Lütfen sayısal bir değer giriniz.')
                            return {
                                result: false,
                                value: null
                            }
                        }

                        if(toInt < 1 || toInt > RaffleLimits.MAX_WINNER_COUNT){
                            await message.channel.send(':boom: Çekiliş kazanan sayısı 1 ila 20 arasında olmalıdır.')
                            return {
                                result: false,
                                value: null
                            }
                        }

                        await message.channel.send(`${Constants.CONFETTI_REACTION_EMOJI} Çok iyi! Bu çekilişte toplam **${toInt}** kişinin yüzünü güldüreceksiniz :slight_smile:!`)
                        return {
                            result: true,
                            value: toInt
                        }
                    },
                    skippable: false
                }),
                new SetupPhase({
                    message: [
                        '**Adım 3:** Şimdide insanların çekilişe katılımlarını alabilmek için süre belirleyelim\n',
                        '`Unutmayın süre en az 1 dakika, en fazla 60 gün olabilir. Süre belirlerken m (dakika), h (saat), d (gün) gibi süre belirten' +
                        ' terimler kullanmanız gerekir. Bunu kullanırken önce süre daha sonra boşluk bırakarak veya bırakmadan süre cinsini yazmayı unutmayın. Sadece tek bir süre tipi' +
                        ' kullanabileceğinizi unutmayın.`'
                    ],
                    validator: async (message: Message) => {
                        const time = message.content.replace(/ /g, '')
                        const toSecond = detectTime(time)
                        if(!toSecond){
                            await message.channel.send('Lütfen geçerli bir süre giriniz. (Örn; **1s** - **1m** - **5m** - **1h** vb.)')
                            return {
                                result: false,
                                value: null
                            }
                        }

                        if(toSecond < RaffleLimits.MIN_TIME || toSecond > RaffleLimits.MAX_TIME){
                            await message.channel.send(':boom: Çekiliş süresi en az 1 dakika, en fazla 60 gün olabilir.')
                            return {
                                result: false,
                                value: null
                            }
                        }

                        const $secondsToTime = secondsToTime(toSecond)
                        await message.channel.send(`${Constants.CONFETTI_REACTION_EMOJI} Tebrikler! Çekiliş süresi **${$secondsToTime.toString()}** olarak belirlendi.`)
                        return {
                            result: true,
                            value: toSecond
                        }
                    },
                    skippable: false
                })
            ]

            if(server.isPremium()){
                const flagValidator = new FlagValidator(client)
                const runValidator = async (flag: keyof typeof Flags, $message: Message) => {
                    const validate = await flagValidator.validate(flag, $message.content, $message)
                    if(!validate.ok){
                        await $message.channel.send(`:boom: ${validate.message}`)
                        return {
                            result: false,
                            value: null
                        }
                    }

                    let validatorSuccessMessage
                    switch(flag){
                        case 'color':
                            validatorSuccessMessage = `Güzel seçim! Çekiliş rengi **${validate.result}** olarak belirlendi.`
                            break

                        case 'servers':
                            validatorSuccessMessage = `Tamamdır! Toplam **${validate.result.length}** sunucuya katılım zorunluluğu eklendi.`
                            break

                        case 'allowedRoles':
                            validatorSuccessMessage = `Başarılı! Çekilişe katılmak isteyenlerin **${validate.result.map(role => `<@&${role}>`).join(', ')}**  rollerinin hepsine sahip olmalı.`
                            break

                        case 'rewardRoles':
                            validatorSuccessMessage = `Büyüleyici! Çekilişi kazananlara **${validate.result.map(role => `<@&${role}>`).join(', ')}** rolleri ödül olarak verilecek.`
                            break

                        default:
                            validatorSuccessMessage = 'Burada normalde bu mesaj yerine başka bir mesaj olması gerekirdi fakat bir şeyler ters gittiği için o mesajı göremiyorsun... *Dostum çok şanssızsın*'
                            break
                    }
                    await message.channel.send(`${Constants.CONFETTI_REACTION_EMOJI} ${validatorSuccessMessage}`)
                    return {
                        result: true,
                        value: validate.result
                    }
                }

                const extraPhases = [
                    new SetupPhase({
                        message: [
                            `**Adım 4:** Hadi bir çekiliş rengi belirleyelim.\n`,
                            ':loudspeaker: Eğer bu adımı **atlamak** isterseniz lütfen sohbete `pas`, `skip` veya `geç` yazın.\n',
                            '`Unutmayın yalnızca bir rengin ingilizce adını veya hexadecimal kodunu yazabilirsiniz.`'
                        ],
                        validator: async (message: Message) => runValidator('color', message),
                        skippable: true
                    }),
                    new SetupPhase({
                        message: [
                            '**Adım 5:** Eğer çekilişinize katılmak için insanların belli bir sunucuya katılması gerekiyorsa bu ' +
                            `kısımda hangi sunucular olduğunu belirleyebilirsiniz. Hadi işe koyulalım.\n`,
                            ':loudspeaker: Eğer bu adımı **atlamak** isterseniz lütfen sohbete `pas`, `skip` veya `geç` yazın.\n',
                            '`Katılım zorunluluğu olan sunucuları belirlemek için sunucuların davet bağlantılarını aralarına virgül ' +
                            `koyarak sohbete yazın. Unutmayın maksimum ${RaffleLimits.MAX_SERVER_COUNT} sunucu yazabilirsiniz ve ` +
                            `${SuperClient.NAME} belirlediğiniz tüm sunucular içerisinde bulunmalıdır.\``
                        ],
                        validator: async (message: Message) => runValidator('servers', message),
                        skippable: true
                    }),
                    new SetupPhase({
                        message: [
                            '**Adım 6:** Eğer çekilişinize katılmak için insanların belli bir role sahip olması gerekiyorsa bu ' +
                            'kısımda hangi roller olduğunu belirleyebilirsiniz. *Seçkin üyeleriniz için seçkin çekilişler*\n',
                            ':loudspeaker: Eğer bu adımı **atlamak** isterseniz lütfen sohbete `pas`, `skip` veya `geç` yazın.\n',
                            '`Katılım zorunluluğu olan rolleri belirlemek için rollerin adını veya etiketini aralarına virgül ' +
                            `koyarak sohbete yazın. Unutmayın maksimum ${RaffleLimits.MAX_ALLOWED_ROLE_COUNT} rol yazabilirsiniz ve ` +
                            'çekilişe katılmak isteyen herkeste belirlediğiniz rollerin hepsinin olması gerekir.`'
                        ],
                        validator: async (message: Message) => runValidator('allowedRoles', message),
                        skippable: true
                    }),
                    new SetupPhase({
                        message: [
                            '**Adım 7:** Çekiliş ödülünüzü büyütmeye ne dersiniz? Çekilişi kazanan kişiyi onu diğerlerinden ayırması ' +
                            'için rol verebilirsiniz. *Dostum bu çok havalı*\n',
                            ':loudspeaker: Eğer bu adımı **atlamak** isterseniz lütfen sohbete `pas`, `skip` veya `geç` yazın.\n',
                            '`Ödül olarak verilecek rolleri belirlemek için rollerin adını veya etiketini aralarına virgül ' +
                            `koyarak sohbete yazın. Unutmayın maksimum ${RaffleLimits.MAX_REWARD_ROLE_COUNT} rol yazabilirsiniz. ` +
                            'Çekiliş kazananlarına belirlediğiniz tüm roller verilir.`'
                        ],
                        validator: async (message: Message) => runValidator('rewardRoles', message),
                        skippable: true
                    })
                ]

                phases.push(...extraPhases)
            }

            phases.push(
                new SetupPhase({
                    message: [
                        `**Adım ${server.isPremium() ? 8 : 4}:** Son olarak çekilişin ödülünü belirleyelim (Aynı zamanda başlık olarak kullanılacak)\n`,
                        '`Ödülün maksimum uzunluğunun 255 karakter olabileceğini unutmayın.`'
                    ],
                    validator: async (message: Message) => {
                        const prize = message.content
                        if(prize.length > 255){
                            await message.channel.send(':boom: Çekiliş başlığı maksimum 255 karakter uzunluğunda olmalıdır.')
                            return {
                                result: false,
                                value: null
                            }
                        }

                        return {
                            result: true,
                            value: prize
                        }
                    },
                    skippable: false
                })
            )

            const setup = new InteractiveSetup({
                user_id: message.author.id,
                channel_id: message.channel.id,
                client,
                phases,
                onFinishCallback: (store) => {
                    const channel = message.guild.channels.cache.get(store.get(0))
                    if(channel instanceof TextChannel){
                        const finishAt: number = Date.now() + (store.get(2) * 1000)
                        let data = {
                            prize: store.get(server.isPremium() ? 7 : 3),
                            server_id: message.guild.id,
                            constituent_id: message.author.id,
                            channel_id: store.get(0),
                            numberOfWinners: store.get(1),
                            status: 'CONTINUES',
                            finishAt: new Date(finishAt)
                        }

                        if(server.isPremium()){
                            data = Object.assign(data, {
                                color: store.get(3),
                                server: store.get(4),
                                allowedRoles: store.get(5),
                                rewardRoles: store.get(6)
                            })
                        }

                        const raffle = new Raffle(Object.assign({
                            createdAt: new Date()
                        }, data as IRaffle))

                        channel.send(Raffle.getStartMessage(), {
                            embed: raffle.buildEmbed()
                        }).then(async $message => {
                            await Promise.all([
                                $message.react(Constants.CONFETTI_REACTION_EMOJI),
                                server.raffles.create(Object.assign({
                                    message_id: $message.id
                                }, data) as IRaffle)
                            ])
                        }).catch(async () => {
                            await message.channel.send(':boom: Botun yetkileri, bu kanalda çekiliş oluşturmak için yetersiz olduğu için çekiliş başlatılamadı.')
                        })

                        message.channel.send(`:star2: Çekiliş başarıyla oluşturuldu! Oluşturduğun çekiliş <#${store.get(0)}> kanalında yayınlandı...`)
                    }else{
                        message.channel.send(`:boom: Çekiliş oluşturulamadı. Girdiğiniz kanal sunucunuzda bulunamadı. Birden bire yok olmuş...`)
                    }

                    return true
                },
                timeout: 60 * 10
            })

            setup.on('stop', async reason => {
                await message.channel.send(`:boom: ${reason}`)
            })
            setup.on('message', async content => {
                await message.channel.send(content)
            })

            setup.start()
        }

        return true
    }

}
