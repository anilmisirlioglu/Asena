import Command, { Group, Result } from '../Command';
import Premium from '../../decorators/Premium';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { CommandInteraction } from 'discord.js';
import FlagValidator from '../../utils/FlagValidator';
import { RaffleLimits } from '../../Constants';
import { secondsToString } from '../../utils/DateTimeHelper';

const RED_TICK = '<:red_tick:737035767150411889>'
const GREEN_TICK = '<:green_tick:737035767301275770>'

@Premium
class Edit extends Command{

    constructor(){
        super({
            name: 'edit',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.edit.description',
            permission: 'ADMINISTRATOR',
            examples: [
                'option: color operator: + value: FFFFFF',
                'option: color operator: + value: D7B5EB giveaway: 814668595170639873',
                'option: prize operator: + value: Lorem Ipsum',
                'option: reward-roles operator: + value: @Role,RoleID',
                'option: time operator: + value: 1h5m',
                'option: time operator: - value: 10m',
                'option: winners operator: + value: 3'
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<Result>{
        const key = action.options.getString('option', true)
        const value = action.options.getString('value', true)

        const message_id = action.options.getString('giveaway', false)
        if(message_id && !/^\d{17,19}$/g.test(message_id)){
            return this.error('commands.raffle.edit.invalid.id')
        }


        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            return this.error('commands.raffle.edit.not.found')
        }

        if(!raffle.isContinues()){
            return this.error('commands.raffle.edit.not.continues')
        }

        const fetch = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if(!fetch){
            return this.error('commands.raffle.edit.deleted')
        }

        const validator = new FlagValidator(client, action)
        let updateQuery, success: string, vars: Array<number | string>
        switch(key){
            case 'color':
                const validateColor = await validator.validate('color', value)
                if(!validateColor.ok){
                    await action.reply(RED_TICK + ' ' + server.translate(validateColor.message))

                    return null
                }

                const color = validateColor.result

                updateQuery = { color }
                success = 'color'
                vars = [color]
                break

            case 'prize':
                const validatePrize = await validator.validate('prize', value)
                if(!validatePrize.ok){
                    await action.reply(RED_TICK + ' ' + server.translate(validatePrize.message))

                    return null
                }

                updateQuery = { prize: value }
                success = 'prize'
                vars = [value]
                break

            case 'rewardRoles':
                const mode = action.options.getString('operator')
                if(mode !== '+' && mode !== '-'){
                    await action.reply(RED_TICK + ' ' + server.translate('commands.raffle.edit.invalid.mode', `${server.prefix}edit rewardRoles + rol`))

                    return null
                }

                const validateRoles = await validator.validate('rewardRoles', value)
                if(!validateRoles.ok){
                    await action.reply(RED_TICK + ' ' + server.translate(validateRoles.message, ...validateRoles.args))

                    return null
                }

                const modeIsSum = mode === '+'
                const validatedRoles: string[] = validateRoles.result
                const rewardRoles = raffle.rewardRoles
                const rewardRoleCount = modeIsSum ? rewardRoles.length + validatedRoles.length : rewardRoles.length - validatedRoles.length
                if(rewardRoleCount > RaffleLimits.MAX_REWARD_ROLE_COUNT){
                    await action.reply(RED_TICK + ' ' + server.translate('commands.raffle.edit.role.max', RaffleLimits.MAX_REWARD_ROLE_COUNT))

                    return null
                }

                for(const role of validatedRoles){
                    const include = rewardRoles.includes(role)
                    if(modeIsSum ? include : !include){
                        await action.reply(RED_TICK + ' ' + server.translate('commands.raffle.edit.role.' + (modeIsSum ? 'already' : 'not.found'), `<@&${role}>`))

                        return null
                    }
                }

                updateQuery = {
                    [modeIsSum ? '$push' : '$pull']: {
                        rewardRoles: modeIsSum ? validatedRoles : {
                            $in: validatedRoles
                        }
                    }
                }
                success = 'roles'
                vars = [
                    server.translate('global.roles' + (modeIsSum ? 'added' : 'removed')),
                    validatedRoles.map(role => `<@&${role}>`).join(', ')
                ]
                break

            case 'time':
                const timeMode = action.options.getString('operator')
                if(timeMode !== '+' && timeMode !== '-'){
                    await action.reply(RED_TICK + ' ' + server.translate('commands.raffle.edit.invalid.mode', `${server.prefix}edit time + 1m`))

                    return null
                }

                if(Date.now() > +raffle.finishAt + (1000 * 60 * 2)){
                    await action.reply(RED_TICK + ' ' + server.translate('commands.raffle.edit.time.little.left'))

                    return null
                }

                const validateTime = await validator.validate('time', value)
                if(!validateTime.ok){
                    await action.reply(RED_TICK + ' ' + server.translate(validateTime.message))

                    return null
                }

                let finishAt = +raffle.finishAt, successText
                const result = validateTime.result * 1000 // second
                switch(timeMode){
                    case '-':
                        if(1000 * 2 * 60 > (finishAt - result) - Date.now()){
                            await action.reply(RED_TICK + ' ' + server.translate('commands.raffle.edit.time.down.error'))

                            return null
                        }

                        finishAt = finishAt - result
                        successText = server.translate('commands.raffle.edit.time.down.success', secondsToString(result / 1000, server.locale).toString())
                        break

                    case '+':
                        if(Date.now() - (finishAt + result) > RaffleLimits.MAX_TIME){
                            await action.reply(RED_TICK + ' ' + server.translate('commands.raffle.edit.time.up.error'))

                            return null
                        }

                        finishAt = finishAt + result
                        successText = server.translate('commands.raffle.edit.time.up.success', secondsToString(result / 1000, server.locale).toString())
                        break
                }

                updateQuery = { finishAt: new Date(finishAt) }
                success = 'time'
                vars = [successText]
                break

            case 'winners':
                const validateNumber = await validator.validate('numberOfWinners', value)
                if(!validateNumber.ok){
                    await action.reply(RED_TICK + ' ' + server.translate(validateNumber.message))

                    return null
                }

                updateQuery = { numberOfWinners: validateNumber.result }
                success = 'winners'
                vars = [validateNumber.result]
                break
        }

        await Promise.all([
            raffle.update(updateQuery).then(async () => {
                await fetch.edit({
                    embeds: [raffle.buildEmbed()]
                })
            }),
            action.reply(GREEN_TICK + ' ' + server.translate('commands.raffle.edit.success.' + success, ...vars))
        ])

        return null
    }

}

export default Edit
