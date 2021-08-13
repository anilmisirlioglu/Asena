import Command, { Group } from '../Command';
import Premium from '../../decorators/Premium';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Message } from 'discord.js';
import FlagValidator from '../../utils/FlagValidator';
import { RaffleLimits } from '../../Constants';
import { secondsToString } from '../../utils/DateTimeHelper';

const RED_TICK = '<:red_tick:737035767150411889>'
const GREEN_TICK = '<:green_tick:737035767301275770>'

@Premium
class EditRaffle extends Command{

    constructor(){
        super({
            name: 'edit',
            group: Group.GIVEAWAY,
            aliases: ['düzenle', 'set'],
            description: 'commands.raffle.edit.description',
            usage: 'commands.raffle.edit.usage',
            permission: 'ADMINISTRATOR',
            examples: [
                'color FFFFFF',
                'color D7B5EB --raffle 814668595170639873',
                'prize Lorem Ipsum',
                'rewardRoles + @Role,RoleID'
            ]
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
                    embeds: [this.getErrorEmbed(server.translate('commands.raffle.edit.invalid.id'))]
                })

                return true
            }
        }

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await message.channel.send({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.edit.not.found'))]
            })

            return true
        }

        if(!raffle.isContinues()){
            await message.channel.send({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.edit.not.continues'))]
            })

            return true
        }

        const fetch = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if(!fetch){
            await message.channel.send({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.edit.deleted'))]
            })

            return true
        }

        const validator = new FlagValidator(client, message)
        let updateQuery, success: string, vars: Array<number | string>
        switch(key){
            case 'renk':
            case 'color':
                const validateColor = await validator.validate('color', value)
                if(!validateColor.ok){
                    await message.channel.send(RED_TICK + ' ' + server.translate(validateColor.message))

                    return true
                }

                const color = validateColor.result

                updateQuery = { color }
                success = 'color'
                vars = [color]
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
                    await message.channel.send(RED_TICK + ' ' + server.translate(validatePrize.message))

                    return true
                }

                updateQuery = {
                    prize: text
                }
                success = 'prize'
                vars = [text]
                break

            case 'ödülrol':
            case 'rewardRoles':
            case 'rewardRole':
                const mode = args.shift()
                if(mode !== '+' && mode !== '-'){
                    await message.channel.send(RED_TICK + ' ' + server.translate('commands.raffle.edit.invalid.mode', `${server.prefix}edit rewardRoles + rol`))

                    return true
                }

                let roles = args.join(' ')
                if(message_id){
                    roles = args.slice(0, args.length - 2).join(' ')
                }

                const validateRoles = await validator.validate('rewardRoles', roles)
                if(!validateRoles.ok){
                    await message.channel.send(RED_TICK + ' ' + server.translate(validateRoles.message, ...validateRoles.args))

                    return true
                }

                const validatedRoles: string[] = validateRoles.result
                const rewardRoles = raffle.rewardRoles
                const evaluate = eval(`${rewardRoles.length} ${mode} ${validatedRoles.length}`)
                if((Number(evaluate) || 0) > RaffleLimits.MAX_REWARD_ROLE_COUNT){
                    await message.channel.send(RED_TICK + ' ' + server.translate('commands.raffle.edit.role.max', RaffleLimits.MAX_REWARD_ROLE_COUNT))

                    return true
                }

                const check = mode === '+'
                for(const role of validatedRoles){
                    const include = rewardRoles.includes(role)
                    if(check ? include : !include){
                        await message.channel.send(RED_TICK + ' ' + server.translate('commands.raffle.edit.role.' + (check ? 'already' : 'not.found'), `<@&${role}>`))

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
                success = 'roles'
                vars = [
                    server.translate('global.roles' + (check ? 'added' : 'removed')),
                    validatedRoles.map(role => `<@&${role}>`).join(', ')
                ]
                break

            case 'time':
            case 'zaman':
                const timeMode = args.shift()
                if(timeMode !== '+' && timeMode !== '-'){
                    await message.channel.send(RED_TICK + ' ' + server.translate('commands.raffle.edit.invalid.mode', `${server.prefix}edit time + 1m`))

                    return true
                }

                if(Date.now() > +raffle.finishAt + (1000 * 60 * 2)){
                    await message.channel.send(RED_TICK + ' ' + server.translate('commands.raffle.edit.time.little.left'))

                    return true
                }

                const time = args.shift()
                if(!time){
                    await message.channel.send(RED_TICK + ' ' + server.translate('commands.raffle.edit.invalid.time'))

                    return true
                }

                const validateTime = await validator.validate('time', time)
                if(!validateTime.ok){
                    await message.channel.send(RED_TICK + ' ' + server.translate(validateTime.message))

                    return true
                }

                let finishAt = +raffle.finishAt, successText
                const result = validateTime.result * 1000 // second
                switch(timeMode){
                    case '-':
                        if(1000 * 2 * 60 > (finishAt - result) - Date.now()){
                            await message.channel.send(RED_TICK + ' ' + server.translate('commands.raffle.edit.time.down.error'))

                            return true
                        }

                        finishAt = finishAt - result
                        successText = server.translate('commands.raffle.edit.time.down.success', secondsToString(result / 1000, server.locale).toString())
                        break

                    case '+':
                        if(Date.now() - (finishAt + result) > RaffleLimits.MAX_TIME){
                            await message.channel.send(RED_TICK + ' ' + server.translate('commands.raffle.edit.time.up.error'))

                            return true
                        }

                        finishAt = finishAt + result
                        successText = server.translate('commands.raffle.edit.time.up.success', secondsToString(result / 1000, server.locale).toString())
                        break
                }

                updateQuery = {
                    finishAt: new Date(finishAt)
                }
                success = 'time'
                vars = [successText]
                break

            case 'kazanan':
            case 'numberOfWinners':
            case 'numberOfWinner':
            case 'winners':
                const validateNumber = await validator.validate('numberOfWinners', value)
                if(!validateNumber.ok){
                    await message.channel.send(RED_TICK + ' ' + server.translate(validateNumber.message))

                    return true
                }

                updateQuery = {
                    numberOfWinners: validateNumber.result
                }
                success = 'winners'
                vars = [validateNumber.result]
                break

            default:
                return false
        }

        await Promise.all([
            raffle.update(updateQuery).then(async () => {
                await fetch.edit({
                    embeds: [raffle.buildEmbed()]
                })
            }),
            message.channel.send(GREEN_TICK + ' ' + server.translate('commands.raffle.edit.success.' + success, ...vars))
        ])

        return true
    }

}

export default EditRaffle
