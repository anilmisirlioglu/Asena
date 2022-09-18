import SuperClient from '../SuperClient';
import { ChatInputCommandInteraction, Colors, GuildMember, Invite, PermissionsBitField, Role } from 'discord.js';
import { GiveawayLimits } from '../Constants';
import { strToSeconds } from './DateTimeHelper';
import Image from './Image';

interface FlagValidatorResult{
    readonly ok: boolean,
    readonly message?: string,
    args?: Array<number | string>
    readonly result?: any
}

type FlagMap = {
    [key: string]: (client: SuperClient, action: ChatInputCommandInteraction, value: string | number) => Promise<FlagValidatorResult>
}

export const Flags: FlagMap = {
    numberOfWinners: async (client, action, value: number) => {
        if(isNaN(value)){
            return {
                ok: false,
                message: 'validator.winners.nan'
            }
        }

        if(value > GiveawayLimits.MAX_WINNER_COUNT || value < 1){
            return {
                ok: false,
                message: 'validator.winners.limit'
            }
        }

        return {
            ok: true,
            result: value
        }
    },
    time: async (client, action, value: string) => {
        const toSecond = strToSeconds(value)
        if(toSecond <= 0){
            return {
                ok: false,
                message: 'validator.time.invalid'
            }
        }

        if(toSecond < GiveawayLimits.MIN_TIME || toSecond > GiveawayLimits.MAX_TIME){
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
    prize: async (client, action, value: string) => {
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
    servers: async (client, action, value: string) => {
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

            if(fetchInvite.guild.id === action.guild.id){
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

        if(invites.length > GiveawayLimits.MAX_SERVER_COUNT){
            return {
                ok: false,
                message: 'validator.servers.limit',
                args: [GiveawayLimits.MAX_SERVER_COUNT]
            }
        }

        return {
            ok: true,
            result: invites
        }
    },
    color: async (client, action, value: string) => {
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
    allowedRoles: async (client, action, value: string) => {
        const roles = value.split(',')
        const allowedRoles = []

        let fetchRole: Role | undefined
        for(const role of roles){
            const matchRole = role.removeWhiteSpaces().match(/(\d{17,19})/g)
            if(matchRole && matchRole.length !== 0){
                fetchRole = await action.guild.roles.fetch(matchRole.shift())
            }else{
                fetchRole = action.guild.roles.cache.find(key => key.name === role.trim())
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

        if(allowedRoles.length > GiveawayLimits.MAX_ALLOWED_ROLE_COUNT){
            return {
                ok: false,
                message: 'validator.roles.allowed.limit',
                args: [GiveawayLimits.MAX_ALLOWED_ROLE_COUNT]
            }
        }

        return {
            ok: true,
            result: allowedRoles
        }
    },
    rewardRoles: async (client, action, value: string) => {
        const me = action.guild.members.me
        if(!me.permissions.has(PermissionsBitField.Flags.ManageRoles)){
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
                fetchRole = await action.guild.roles.fetch(matchRole.shift())
            }else{
                fetchRole = action.guild.roles.cache.find(key => key.name === role.trim())
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

            if(fetchRole.comparePositionTo((action.member as GuildMember).roles.highest) >= 0){
                return {
                    ok: false,
                    message: 'validator.roles.insufficient',
                    args: [(action.member as GuildMember).roles.highest.name, fetchRole.name]
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

        if(rewardRoles.length > GiveawayLimits.MAX_REWARD_ROLE_COUNT){
            return {
                ok: false,
                message: 'validator.roles.reward.limit',
                args: [GiveawayLimits.MAX_REWARD_ROLE_COUNT]
            }
        }

        return {
            ok: true,
            result: rewardRoles
        }
    },
    banner: async (client, action, value: string) => {
        if(value.startsWith('http://')){
            return {
                ok: false,
                message: 'validator.banner.invalid.protocol'
            }
        }

        const image = new Image(value)
        if(!image.isValidURL()){
            return {
                ok: false,
                message: 'validator.banner.invalid.url'
            }
        }

        if(!await image.isValidImage()){
            return {
                ok: false,
                message: 'validator.banner.invalid.image'
            }
        }

        return {
            ok: true,
            result: value
        }
    }
}

export default class FlagValidator{

    private readonly client: SuperClient
    private readonly action?: ChatInputCommandInteraction

    constructor(client: SuperClient, action?: ChatInputCommandInteraction){
        this.client = client
        this.action = action
    }

    async validate(
        key: keyof typeof Flags,
        value: string | number,
        action?: ChatInputCommandInteraction
    ): Promise<FlagValidatorResult>{
        const callback = Flags[key]

        const run = await callback(this.client, action ?? this.action, value)

        run.args = run.args || []
        return run
    }

}
