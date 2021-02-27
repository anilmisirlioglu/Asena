import Command from '../Command'
import { secondsToString, detectTime } from '../../utils/DateTimeHelper'
import { Message, TextChannel } from 'discord.js'
import { Emojis, RaffleLimits } from '../../Constants'
import InteractiveSetup from '../../setup/InteractiveSetup'
import SetupPhase from '../../setup/SetupPhase'
import SuperClient from '../../SuperClient'
import { IRaffle } from '../../models/Raffle'
import Server from '../../structures/Server'
import Raffle from '../../structures/Raffle'
import FlagValidator, { Flags } from '../../utils/FlagValidator';

const PREFIX = ':boom: '

export default class SetupRaffle extends Command{

    constructor(){
        super({
            name: 'setup',
            aliases: ['sihirbaz'],
            description: 'commands.raffle.setup.description',
            usage: null,
            permission: 'ADMINISTRATOR',
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        if(message.channel instanceof TextChannel){
            if(client.getSetupManager().inSetup(message.author.id)){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.setup.already'))
                })

                return true
            }

            const max = RaffleLimits[`MAX_COUNT${server.isPremium() ? '_PREMIUM' : ''}`]
            const result = await server.raffles.getContinues()
            if(result.length >= max){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.create.limits.max.created', max))
                })

                return true
            }

            const phases = [
                new SetupPhase({
                    message: Emojis.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.channel.message', client.user.username),
                    validator: async (message: Message) => {
                        const channels = message.mentions.channels
                        if(channels.size === 0){
                            await message.channel.send(PREFIX + server.translate('commands.raffle.setup.phases.channel.validator.channel.none'))
                            return {
                                result: false,
                                value: null
                            }
                        }

                        const channel = channels.first()
                        if(!(channel instanceof TextChannel)){
                            await message.channel.send(PREFIX + server.translate('commands.raffle.setup.phases.channel.validator.channel.invalid'))
                            return {
                                result: false,
                                value: null
                            }
                        }

                        await message.channel.send(Emojis.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.channel.validator.success', `<#${channel.id}>`))
                        return {
                            result: true,
                            value: channel.id
                        }
                    },
                    skippable: false
                }),
                new SetupPhase({
                    message: server.translate('commands.raffle.setup.phases.winners.message'),
                    validator: async (message: Message) => {
                        const toInt: number = Number(message.content.trim())
                        if(isNaN(toInt)){
                            await message.channel.send(PREFIX + server.translate('commands.raffle.setup.phases.winners.validator.non.integer'))
                            return {
                                result: false,
                                value: null
                            }
                        }

                        if(toInt < 1 || toInt > RaffleLimits.MAX_WINNER_COUNT){
                            await message.channel.send(PREFIX + server.translate('commands.raffle.create.limits.winner.count'))
                            return {
                                result: false,
                                value: null
                            }
                        }

                        await message.channel.send(Emojis.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.winners.validator.success', toInt))
                        return {
                            result: true,
                            value: toInt
                        }
                    },
                    skippable: false
                }),
                new SetupPhase({
                    message: server.translate('commands.raffle.setup.phases.time.message'),
                    validator: async (message: Message) => {
                        const time = message.content.replace(/ /g, '')
                        const toSecond = detectTime(time)
                        if(!toSecond){
                            await message.channel.send(PREFIX + server.translate('commands.raffle.create.limits.time.invalid'))
                            return {
                                result: false,
                                value: null
                            }
                        }

                        if(toSecond < RaffleLimits.MIN_TIME || toSecond > RaffleLimits.MAX_TIME){
                            await message.channel.send(PREFIX + server.translate('commands.raffle.create.limits.time.exceeded'))
                            return {
                                result: false,
                                value: null
                            }
                        }

                        const $secondsToTime = secondsToString(toSecond, server.locale)
                        await message.channel.send(Emojis.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.time.validator.success', $secondsToTime.toString()))
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
                        await $message.channel.send(`:boom: ${server.translate(validate.message, ...validate.args)}`)
                        return {
                            result: false,
                            value: null
                        }
                    }

                    let key: string, args: Array<number | string>
                    switch(flag){
                        case 'color':
                            key = 'color'
                            args = [validate.result]
                            break

                        case 'servers':
                            key = 'servers'
                            args = [validate.result.length]
                            break

                        case 'allowedRoles':
                            key = 'roles.allowed'
                            args = [validate.result.map(role => `<@&${role}>`).join(', ')]
                            break

                        case 'rewardRoles':
                            key = 'roles.reward'
                            args = [validate.result.map(role => `<@&${role}>`).join(', ')]
                            break
                    }

                    await message.channel.send(Emojis.CONFETTI_REACTION_EMOJI + ' ' + server.translate(`commands.raffle.setup.phases.${key}.validator.success`, ...args))
                    return {
                        result: true,
                        value: validate.result
                    }
                }

                const extraPhases = [
                    new SetupPhase({
                        message: server.translate('commands.raffle.setup.phases.color.message'),
                        validator: async (message: Message) => runValidator('color', message),
                        skippable: true
                    }),
                    new SetupPhase({
                        message: server.translate('commands.raffle.setup.phases.servers.message', RaffleLimits.MAX_SERVER_COUNT, SuperClient.NAME),
                        validator: async (message: Message) => runValidator('servers', message),
                        skippable: true
                    }),
                    new SetupPhase({
                        message: server.translate('commands.raffle.setup.phases.roles.allowed.message', RaffleLimits.MAX_ALLOWED_ROLE_COUNT),
                        validator: async (message: Message) => runValidator('allowedRoles', message),
                        skippable: true
                    }),
                    new SetupPhase({
                        message: server.translate('commands.raffle.setup.phases.roles.allowed.message', RaffleLimits.MAX_REWARD_ROLE_COUNT),
                        validator: async (message: Message) => runValidator('rewardRoles', message),
                        skippable: true
                    })
                ]

                phases.push(...extraPhases)
            }

            phases.push(
                new SetupPhase({
                    message: server.translate('commands.raffle.setup.phases.prize.message', server.isPremium() ? 8 : 4),
                    validator: async (message: Message) => {
                        const prize = message.content
                        if(prize.length > 255){
                            await message.channel.send(PREFIX + server.translate('commands.raffle.create.limits.title.length'))
                            return {
                                result: false,
                                value: null
                            }
                        }

                        await message.channel.send(Emojis.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.prize.validator.success', prize))
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
                server,
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
                        }, data as IRaffle), server.locale)

                        channel.send(Raffle.getStartMessage(), {
                            embed: raffle.buildEmbed()
                        }).then(async $message => {
                            await Promise.all([
                                $message.react(Emojis.CONFETTI_REACTION_EMOJI),
                                server.raffles.create(Object.assign({
                                    message_id: $message.id
                                }, data) as IRaffle)
                            ])
                        }).catch(async () => {
                            await message.channel.send(PREFIX + server.translate('commands.raffle.setup.unauthorized'))
                        })

                        message.channel.send(':star2: ' + server.translate('commands.raffle.setup.success', `<#${store.get(0)}>`))
                    }else{
                        message.channel.send(PREFIX + server.translate('commands.raffle.setup.channel.gone'))
                    }

                    return true
                },
                timeout: 60 * 10
            })

            setup.on('stop', async reason => {
                await message.channel.send(PREFIX + server.translate(reason))
            })

            setup.on('message', async content => {
                await message.channel.send(content)
            })

            setup.start()
        }

        return true
    }

}
