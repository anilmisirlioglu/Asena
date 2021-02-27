import Command from '../Command'
import { secondsToString, strToSeconds } from '../../utils/DateTimeHelper'
import { Message, TextChannel } from 'discord.js'
import Constants from '../../Constants'
import InteractiveSetup from '../../setup/InteractiveSetup'
import SetupPhase from '../../setup/SetupPhase'
import SuperClient from '../../SuperClient';
import { IRaffle } from '../../models/Raffle';
import Server from '../../structures/Server';
import Raffle from '../../structures/Raffle';

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

            const result = await server.raffles.getContinues()
            if(result.length >= 5){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.create.limits.max.created'))
                })
                return true
            }

            const setup = new InteractiveSetup({
                user_id: message.author.id,
                channel_id: message.channel.id,
                client,
                phases: [
                    new SetupPhase({
                        message: Constants.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.channel.message', client.user.username),
                        validator: (message: Message) => {
                            const channels = message.mentions.channels
                            if(channels.size === 0){
                                message.channel.send(PREFIX + server.translate('commands.raffle.setup.phases.channel.validator.channel.none'))
                                return {
                                    result: false,
                                    value: null
                                }
                            }

                            const channel = channels.first()
                            if(!(channel instanceof TextChannel)){
                                message.channel.send(PREFIX + server.translate('commands.raffle.setup.phases.channel.validator.channel.invalid'))
                                return {
                                    result: false,
                                    value: null
                                }
                            }

                            message.channel.send(Constants.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.channel.validator.success', `<#${channel.id}>`))
                            return {
                                result: true,
                                value: channel.id
                            }
                        }
                    }),
                    new SetupPhase({
                        message: server.translate('commands.raffle.setup.phases.winners.message'),
                        validator: (message: Message) => {
                            const toInt: number = Number(message.content.trim())
                            if(isNaN(toInt)){
                                message.channel.send(PREFIX + server.translate('commands.raffle.setup.phases.winners.validator.non.integer'))
                                return {
                                    result: false,
                                    value: null
                                }
                            }

                            if(toInt < 1 || toInt > 20){
                                message.channel.send(PREFIX + server.translate('commands.raffle.create.limits.winner.count'))
                                return {
                                    result: false,
                                    value: null
                                }
                            }

                            message.channel.send(Constants.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.winners.validator.success', toInt))
                            return {
                                result: true,
                                value: toInt
                            }
                        }
                    }),
                    new SetupPhase({
                        message: server.translate('commands.raffle.setup.phases.time.message'),
                        validator: (message: Message) => {
                            const time = message.content.replace(/ /g, '')
                            const toSecond = strToSeconds(time)
                            if(toSecond <= 0){
                                message.channel.send(PREFIX + server.translate('commands.raffle.create.limits.time.invalid'))
                                return {
                                    result: false,
                                    value: null
                                }
                            }

                            if(toSecond < Constants.MIN_RAFFLE_TIME || toSecond > Constants.MAX_RAFFLE_TIME){
                                message.channel.send(PREFIX + server.translate('commands.raffle.create.limits.time.exceeded'))
                                return {
                                    result: false,
                                    value: null
                                }
                            }

                            const $secondsToTime = secondsToString(toSecond, server.locale)
                            message.channel.send(Constants.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.time.validator.success', $secondsToTime.toString()))
                            return {
                                result: true,
                                value: toSecond
                            }
                        }
                    }),
                    new SetupPhase({
                        message: server.translate('commands.raffle.setup.phases.prize.message'),
                        validator: (message: Message) => {
                            const prize = message.content
                            if(prize.length > 255){
                                message.channel.send(PREFIX + server.translate('commands.raffle.create.limits.title.length'))
                                return {
                                    result: false,
                                    value: null
                                }
                            }

                            message.channel.send(Constants.CONFETTI_REACTION_EMOJI + ' ' + server.translate('commands.raffle.setup.phases.prize.validator.success', prize))
                            return {
                                result: true,
                                value: prize
                            }
                        }
                    })
                ],
                onFinishCallback: (store) => {
                    const channel = message.guild.channels.cache.get(store.get(0))
                    if(channel instanceof TextChannel){
                        const finishAt: number = Date.now() + (store.get(2) * 1000)
                        const data = {
                            prize: store.get(3),
                            server_id: message.guild.id,
                            constituent_id: message.author.id,
                            channel_id: store.get(0),
                            numbersOfWinner: store.get(1),
                            status: 'CONTINUES',
                            finishAt: new Date(finishAt)
                        }

                        const raffle = new Raffle(Object.assign({
                            createdAt: new Date()
                        }, data as IRaffle))

                        channel.send(Raffle.getStartMessage(server), {
                            embed: raffle.getEmbed(server)
                        }).then(async $message => {
                            await $message.react(Constants.CONFETTI_REACTION_EMOJI)

                            await server.raffles.create(Object.assign({
                                message_id: $message.id
                            }, data) as IRaffle)
                        }).catch(async () => {
                            await message.channel.send(PREFIX + server.translate('commands.raffle.setup.unauthorized'))
                        })

                        message.channel.send(':star2: ' + server.translate('commands.raffle.setup.success', `<#${store.get(0)}>`))
                    }else{
                        message.channel.send(PREFIX + server.translate('commands.raffle.setup.channel.gone'))
                    }

                    return true
                },
                timeout: 60 * 5
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
