import SuperClient from '../SuperClient';
import { Invite, Message, Role } from 'discord.js';
import { RaffleLimits } from '../Constants';
import { detectTime } from './DateTimeHelper';

interface FlagValidatorReturnType{
    readonly ok: boolean,
    readonly message?: string,
    args?: Array<number | string>
    readonly result?: any
}

type FlagMap = {
    [key: string]: (client: SuperClient, message: Message, value: string) => Promise<FlagValidatorReturnType>
}

export const RequiredFlags = ['numberOfWinners', 'time', 'prize']

export const Flags: FlagMap = {
    numberOfWinners: async (client, message, value) => {
        const number = Number(value.removeWhiteSpaces())
        if(isNaN(number)){
            return {
                ok: false,
                message: 'validator.winners.nan'
            }
        }

        if(number > RaffleLimits.MAX_WINNER_COUNT || number < 1){
            return {
                ok: false,
                message: 'validator.winners.limit'
            }
        }

        return {
            ok: true,
            result: number
        }
    },
    time: async (client, message, value) => {
        const toSecond: number = detectTime(value);
        if(!toSecond){
            return {
                ok: false,
                message: 'validator.time.invalid'
            }
        }

        if(toSecond < RaffleLimits.MIN_TIME || toSecond > RaffleLimits.MAX_TIME){
            return {
                ok: false,
                message: 'validator.time.limit'
            }
        }

        return {
            ok: true,
            result: toSecond
        }
    },
    prize: async (client, message, value) => {
        if(value.length === 0 || value.length > 255){
            return {
                ok: false,
                message: 'validator.prize.length'
            }
        }

        return {
            ok: true,
            result: value
        }
    },
    servers: async (client, message, value) => {
        const servers = value.removeWhiteSpaces().split(',')
        const filterServers = servers.filter(server => {
            const match = server.match(/(https?:\/\/)?(www\.)?(discord\.gg|discordapp\.com\/invite)\/.?(?:[a-zA-Z0-9\-]{2,32})/g)

            return match && match.length !== 0
        })

        if(filterServers.length !== servers.length){
            return {
                ok: false,
                message: 'validator.servers.invalid.invites'
            }
        }

        const invites = []
        for(const invite of servers){
            const fetchInvite: Invite | null = await new Promise(resolve => {
                client.fetchInvite(invite).then(resolve).catch(() => {
                    resolve(null)
                })
            })

            if(!fetchInvite || !fetchInvite.guild){
                return {
                    ok: false,
                    message: 'validator.servers.invalid.invite',
                    args: [invite]
                }
            }

            if(fetchInvite.guild.id === message.guild.id){
                return {
                    ok: false,
                    message: 'validator.servers.self'
                }
            }

            const target = await client.fetchGuild(fetchInvite.guild.id)
            if(!target){
                return {
                    ok: false,
                    message: 'validator.servers.not.found'
                }
            }

            invites.push({
                id: target.id,
                name: target.name,
                invite
            })
        }

        if(invites.checkIfDuplicateExists()){
            return {
                ok: false,
                message: 'validator.servers.duplicate'
            }
        }

        if(invites.length > RaffleLimits.MAX_SERVER_COUNT){
            return {
                ok: false,
                message: 'validator.servers.limit',
                args: [RaffleLimits.MAX_SERVER_COUNT]
            }
        }

        return {
            ok: true,
            result: invites
        }
    },
    color: async (client, message, value) => {
        const matchColor = value.removeWhiteSpaces().match(/#?(?:[0-9a-fA-F]{3}){1,2}|(RED|WHITE|AQUA|GREEN|BLUE|YELLOW|PURPLE|LUMINOUS_VIVID_PINK|GOLD|ORANGE|GREY|NAVY|RANDOM|DARKER_GREY|DARK_AQUA|DARK_GREEN|DARK_BLUE|DARK_PURPLE|DARK_VIVID_PINK|DARK_GOLD|DARK_ORANGE|DARK_RED|DARK_GREY|LIGHT_GREY|DARK_NAVY)/g)
        if(!matchColor || matchColor.length === 0){
            return {
                ok: false,
                message: 'validator.color.invalid'
            }
        }

        return {
            ok: true,
            result: matchColor.shift()
        }
    },
    allowedRoles: async (client, message, value) => {
        const roles = value.split(',')
        const allowedRoles = []

        let fetchRole: Role | undefined
        for(const role of roles){
            const matchRole = role.removeWhiteSpaces().match(/(\d{17,19})/g)
            if(matchRole && matchRole.length !== 0){
                fetchRole = await message.guild.roles.fetch(matchRole.shift())
            }else{
                fetchRole = message.guild.roles.cache.find(key => key.name === role.trim())
            }

            if(!fetchRole){
                return {
                    ok: false,
                    message: 'validator.roles.invalid',
                    args: [role]
                }
            }

            allowedRoles.push(fetchRole.id)
        }

        if(allowedRoles.checkIfDuplicateExists()){
            return {
                ok: false,
                message: 'validator.roles.allowed.duplicate'
            }
        }

        if(allowedRoles.length > RaffleLimits.MAX_ALLOWED_ROLE_COUNT){
            return {
                ok: false,
                message: 'validator.roles.allowed.limit',
                args: [RaffleLimits.MAX_ALLOWED_ROLE_COUNT]
            }
        }

        return {
            ok: true,
            result: allowedRoles
        }
    },
    rewardRoles: async (client, message, value) => {
        const me = message.guild.me
        if(!me.hasPermission('MANAGE_ROLES')){
            return {
                ok: false,
                message: 'validator.roles.unauthorized'
            }
        }

        const roles = value.split(',')
        const rewardRoles = []

        let fetchRole: Role | undefined
        for(const role of roles){
            const matchRole = role.removeWhiteSpaces().match(/(\d{17,19})/g)
            if(matchRole && matchRole.length !== 0){
                fetchRole = await message.guild.roles.fetch(matchRole.shift())
            }else{
                fetchRole = message.guild.roles.cache.find(key => key.name === role.trim())
            }

            if(!fetchRole){
                return {
                    ok: false,
                    message: 'validator.roles.invalid',
                    args: [role]
                }
            }

            if(fetchRole.comparePositionTo(me.roles.highest) > 0){
                return {
                    ok: false,
                    message: 'validator.roles.compare',
                    args: [me.roles.highest.name, fetchRole.name]
                }
            }

            rewardRoles.push(fetchRole.id)
        }

        if(rewardRoles.checkIfDuplicateExists()){
            return {
                ok: false,
                message: 'validator.roles.reward.duplicate'
            }
        }

        if(rewardRoles.length > RaffleLimits.MAX_REWARD_ROLE_COUNT){
            return {
                ok: false,
                message: 'validator.roles.reward.limit',
                args: [RaffleLimits.MAX_REWARD_ROLE_COUNT]
            }
        }

        return {
            ok: true,
            result: rewardRoles
        }
    }
}

export default class FlagValidator{

    private readonly client: SuperClient
    private readonly message?: Message

    constructor(client: SuperClient, message?: Message){
        this.client = client
        this.message = message
    }

    async validate(
        key: keyof typeof Flags,
        value: string,
        message?: Message
    ): Promise<FlagValidatorReturnType>{
        const callback = Flags[key]

        const run = await callback(this.client, message ?? this.message, value)

        run.args = run.args || []
        return run
    }

}
