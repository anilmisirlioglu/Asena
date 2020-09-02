import SuperClient from '../SuperClient';
import { Invite, Message, Role } from 'discord.js';
import { RaffleLimits } from '../Constants';
import { detectTime } from './DateTimeHelper';

interface FlagValidatorReturnType{
    readonly ok: boolean,
    readonly message?: string,
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
                message: 'Lütfen kazanan kişi sayısını sayısal bir değer girin.'
            }
        }

        if(number > RaffleLimits.MAX_WINNER_COUNT || number < 1){
            return {
                ok: false,
                message: 'Çekilişi kazanan üye sayısı maksimum 20, minimum 1 kişi olabilir.'
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
                message: 'Lütfen geçerli bir süre giriniz. (Örn; **1s** - **1m** - **5m** - **1h** vb.)'
            }
        }

        if(toSecond < RaffleLimits.MIN_TIME || toSecond > RaffleLimits.MAX_TIME){
            return {
                ok: false,
                message: 'Çekiliş süresi en az 1 dakika, en fazla 60 gün olabilir.'
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
                message: 'Çekiliş başlığı maksimum 255 karakter uzunluğunda olabilir.'
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
                message: 'Geçersiz davet bağlantısı tespit edildi. Lütfen geçerli davet bağlantısı/bağlantıları girin.'
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
                    message: `Geçersiz davet bağlantısı: **${invite}**`
                }
            }

            if(fetchInvite.guild.id === message.guild.id){
                return {
                    ok: false,
                    message: 'Çekilişi başlattığınız sunucuyu katılım zorunluluğu olan sunucu olarak belirleyemezsiniz.'
                }
            }

            const target = client.guilds.cache.get(fetchInvite.guild.id)
            if(!target){
                return {
                    ok: false,
                    message: `**${client.user.username}** katılım zorunluluğu olan tüm sunucularda bulunmak zorundadır. Lütfen davet bağlantısını girdiğiniz sunucuya **${client.user.username}** \'yı ekleyin.`
                }
            }

            invites.push(target.id)
        }

        if(invites.checkIfDuplicateExists()){
            return {
                ok: false,
                message: 'Davet bağlantılarınızın bazıları aynı sunucuya işaret ediyor. Girdiğiniz her bağlantının farklı sunucuya göstermesi gerekmektedir. Lütfen tekrarlanmayan değerler ile tekrar deneyin.'
            }
        }

        if(invites.length > RaffleLimits.MAX_SERVER_COUNT){
            return {
                ok: false,
                message: `Maksimum ${RaffleLimits.MAX_SERVER_COUNT} sunucuya katılım zorunluluğu koyabilirsiniz.`
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
                message: 'Lütfen geçerli bir renk girin. (Hexadecimal renk kodu veya renk.)'
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
                    message: `Geçersiz rol tespit edildi, tespit edilen rol: **${role}**`
                }
            }

            allowedRoles.push(fetchRole.id)
        }

        if(allowedRoles.checkIfDuplicateExists()){
            return {
                ok: false,
                message: 'Çekişe katılabilecek roller arasında etiketlediğiniz rollerin bazıları aynı. Girdiğiniz her rolün birbirinden benzersiz olması gerekmektedir. Lütfen tekrarlanmayan değerler ile tekrar deneyin.'
            }
        }

        if(allowedRoles.length > RaffleLimits.MAX_ALLOWED_ROLE_COUNT){
            return {
                ok: false,
                message: `Katılım zorunluluğu olarak maksimum ${RaffleLimits.MAX_ALLOWED_ROLE_COUNT} rol belirleyebilirsiniz.`
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
                message: 'Kazanan kişilere ödül olarak rol verebilmek için bota **Rolleri Yönet** yetkisi vermeniz gerekmektedir.'
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
                    message: `Geçersiz rol tespit edildi, tespit edilen rol: **${role}**`
                }
            }

            if(fetchRole.comparePositionTo(me.roles.highest) > 0){
                return {
                    ok: false,
                    message: `**${me.roles.highest.name}** rolü, **${fetchRole.name}** rolünün altında. Botun rolü ödül olarak verilecek rollerin üzerinde olmalıdır. Aksi takdirde ödül olarak rolü kullanıcıya veremez.`
                }
            }

            rewardRoles.push(fetchRole.id)
        }

        if(rewardRoles.checkIfDuplicateExists()){
            return {
                ok: false,
                message: 'Ödül olarak verilecek roller arasında etiketlediğiniz rollerin bazıları aynı. Girdiğiniz her rolün birbirinden benzersiz olması gerekmektedir. Lütfen tekrarlanmayan değerler ile tekrar deneyin.'
            }
        }

        if(rewardRoles.length > RaffleLimits.MAX_REWARD_ROLE_COUNT){
            return {
                ok: false,
                message: `Ödül olarak maksimum ${RaffleLimits.MAX_REWARD_ROLE_COUNT} rol verebilirsiniz.`
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
    private readonly message: Message

    constructor(client: SuperClient, message: Message){
        this.client = client
        this.message = message
    }

    async validate(key: keyof typeof Flags, value: string): Promise<FlagValidatorReturnType>{
        const callback = Flags[key]

        return callback(this.client, this.message, value)
    }

}
