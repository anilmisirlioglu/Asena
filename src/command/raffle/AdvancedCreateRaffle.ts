import Command from '../Command';
import { Message } from 'discord.js';
import Server from '../../structures/Server';
import SuperClient from '../../SuperClient';
import Premium from '../../decorators/Premium';
import FlagValidator, { Flags, RequiredFlags } from '../../utils/FlagValidator';
import { IRaffle } from '../../models/Raffle';
import Raffle from '../../structures/Raffle';
import { Emojis, RaffleLimits } from '../../Constants';

@Premium
export default class AdvancedCreateRaffle extends Command{

    constructor(){
        super({
            name: 'createp',
            aliases: ['cekilisbaslatp', 'createrafflep'],
            description: 'commands.raffle.advanced.description',
            usage: 'commands.raffle.advanced.usage',
            permission: 'ADMINISTRATOR',
            examples: [
                `
                --numberOfWinners 1 
                --time 2m 
                --prize "Test" 
                --color GREEN 
                --rewardRoles @Premium 
                --allowedRoles Asena 
                --servers https://discord.gg/CRgXhfs
                `,
                '--numbersOfWinner 5 --time 1d --prize "Asena Premium"'
            ]
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const regex = /(?<=[-{1,2}|/])(?<name>[a-zA-Z0-9]*)[ |:|"]*(?<value>[\w|.|?|=|<|>|ğüşöçİĞÜŞÖÇ|@|&|+| |:|/|#|,|\\]*)(?=[ |"]|$)/g
        const matchFlags = (message.content.match(regex) ?? []).filter(find => find !== '')

        if(matchFlags.length === 0) return false

        for(const flag of Object.keys(Flags)){
            const filterArgs = matchFlags.filter(arg => arg.startsWith(flag))
            if(filterArgs.length > 1){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.advanced.parameter.duplicate'))
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
                    server.translate('commands.raffle.advanced.parameter.missing'),
                    `<:join_arrow:746358699706024047> **--numberOfWinners**`,
                    `<:join_arrow:746358699706024047> **--time**`,
                    `<:join_arrow:746358699706024047> **--prize**`
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
                    embed: this.getErrorEmbed(server.translate('commands.raffle.advanced.parameter.invalid', key))
                })

                return true
            }

            if(value.length === 0 || value[0] === ''){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.advanced.parameter.empty', key))
                })

                return true
            }

            const validate = await validator.validate(key, value.join(' '))
            if(!validate.ok){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate(validate.message, ...validate.args))
                })

                return true
            }

            raffleProps[key] = validate.result
        }

        const raffles = await server.raffles.getContinues()
        if(raffles.length > RaffleLimits.MAX_COUNT_PREMIUM){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.create.limits.max.created', RaffleLimits.MAX_COUNT_PREMIUM)),
            })

            return true
        }

        const finishAt: number = Date.now() + (Number(raffleProps['time']) * 1000)
        raffleProps['finishAt'] = new Date(finishAt)

        const raffle = new Raffle(Object.assign({
            createdAt: new Date()
        }, raffleProps as IRaffle), server.locale)

        message.channel.send(Raffle.getStartMessage(), {
            embed: raffle.buildEmbed()
        }).then(async $message => {
            await server.raffles.create(Object.assign({
                message_id: $message.id
            }, raffleProps) as IRaffle)

            await $message.react(Emojis.CONFETTI_REACTION_EMOJI)
        }).catch(async () => {
            await message.channel.send(':boom: ' + server.translate('commands.raffle.create.unauthorized'))
        })

        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 0
            })
        }
        return true
    }

}
