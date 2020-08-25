import Command from '../Command';
import { Message } from 'discord.js';
import Server from '../../structures/Server';
import SuperClient from '../../SuperClient';
import Premium from '../../decorators/Premium';
import FlagValidator, { Flags, RequiredFlags } from '../../utils/FlagValidator';
import { IRaffle } from '../../models/Raffle';
import Raffle from '../../structures/Raffle';
import Constants from '../../Constants';

@Premium
export default class AdvancedCreateRaffle extends Command{

    constructor(){
        super({
            name: 'createp',
            aliases: ['cekilisbaslatp', 'createrafflep'],
            description: 'Gelişmiş çekiliş oluşturur.',
            usage: '--numberOfWinners "kazanan sayısı" --time "süre" --prize "ödül" --servers "sunucular" --color "renk" --allowedRoles "roller" --rewardRoles "ödül olarak verilecek roller"',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const regex = /(?<=[-{1,2}|/])(?<name>[a-zA-Z0-9]*)[ |:|"]*(?<value>[\w|.|?|=|<|>|ğüşöçİĞÜŞÖÇ|@|&|+| |:|/|#|,|\\]*)(?=[ |"]|$)/g
        const matchFlags = message.content.match(regex).filter(find => find !== '')

        if(matchFlags.length === 0) return false

        for(const flag of Object.keys(Flags)){
            const filterArgs = matchFlags.filter(arg => arg.startsWith(flag))
            if(filterArgs.length > 1){
                await message.channel.send({
                    embed: this.getErrorEmbed('Lütfen aynı parametreyi birden fazla kez kullanmayın.')
                })

                return true
            }
        }

        const matchRequiredFlags = RequiredFlags
            .filter(required => matchFlags
                .filter(flag => flag.startsWith(required))
                .length !== 0
            )

        if(matchRequiredFlags.length !== RequiredFlags.length){
            await message.channel.send({
                embed: this.getErrorEmbed([
                    `Lütfen yazılması zorunlu olan parametreleri eksiksiz yazın. Gereken parametreler:`,
                    `:join_arrow: **--numberOfWinners**`,
                    `:join_arrow: **--time**`,
                    `:join_arrow: **--prize**`
                ].join('\n'))
            })

            return true
        }

        const raffleProps = {
            server_id: message.guild.id,
            constituent_id: message.author.id,
            channel_id: message.channel.id,
            status: 'CONTINUES'
        }
        const validator = new FlagValidator(client, message)
        for(const param of matchFlags){
            const [key, ...value] = param.split(' ')
            if(!(key in Flags)){
                await message.channel.send({
                    error: this.getErrorEmbed('Geçersiz parametre tespit edildi. Lütfen geçerli parametreler dışında bir parametre girmeden tekrar deneyin.')
                })

                return true
            }

            if(value.length === 0 || value[0] === ''){
                await message.channel.send({
                    error: this.getErrorEmbed(`Lütfen parametre değerlerini boş bırakmayın. Tespit edilen parametre: **--${key}**`)
                })

                return true
            }

            const validate = await validator.validate(key, value.join(' '));
            if(!validate.ok){
                await message.channel.send({
                    embed: this.getErrorEmbed(validate.message)
                })

                return true
            }

            raffleProps[key] = validate.result
        }

        const raffles = await server.raffles.getContinues()
        if(raffles.length > 8){
            await message.channel.send({
                embed: this.getErrorEmbed('Maksimum çekiliş oluşturma sınırına ulaşmışsınız. (Max: 8)')
            })

            return true
        }

        const finishAt: number = Date.now() + (Number(raffleProps['time']) * 1000)
        raffleProps['finishAt'] = new Date(finishAt)

        const raffle = new Raffle(Object.assign({
            createdAt: new Date()
        }, raffleProps as IRaffle))
        message.channel.send(Raffle.getStartMessage(), {
            embed: raffle.getEmbed()
        }).then(async $message => {
            await $message.react(Constants.CONFETTI_REACTION_EMOJI)

            await server.raffles.create(Object.assign({
                message_id: $message.id
            }, raffleProps) as IRaffle)
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
