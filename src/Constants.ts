import { EmojiResolvable, PermissionString } from 'discord.js';

export type Letter = 'a' | 'b' | 'c' | 'd' | 'e'

export interface ILetter{
    name: Letter,
    emoji: EmojiResolvable
}

abstract class Constants{

    public static ASENA_CLIENT_ID: string = '716259870910840832' // Asena Discord ID

    public static SETUP_CANCEL_KEYWORDS: string[] = ['iptal', 'cancel', 'exit']

    public static REQUIRED_PERMISSIONS: PermissionString[] = [
        'SEND_MESSAGES',
        'ADD_REACTIONS',
        'VIEW_CHANNEL',
        'EMBED_LINKS',
        'READ_MESSAGE_HISTORY',
        'USE_EXTERNAL_EMOJIS'
    ]

    public static GRAPH_EMOJI: string = '<:graph:716972905841426453>'
    public static CONFETTI_EMOJI: string = '<a:uwu:716956121289588736>' //<:confetti:713087026051940512>
    public static CONFETTI_REACTION_EMOJI: string = '\uD83C\uDF89'

    public static AGREE_EMOJI_ID: string = '721180088686870549'
    public static DISAGREE_EMOJI_ID: string = '721179958378233887'

    public static AGREE_EMOJI: string = `<a:no:${Constants.AGREE_EMOJI_ID}>`
    public static DISAGREE_EMOJI: string = `<a:yes:${Constants.DISAGREE_EMOJI_ID}>`

    public static RUBY_EMOJI: string = '<a:ruby:721700215190454344>'

    public static PERMITTED_ROLE_NAME: string = 'asena' // if there is no permission, this role is checked

    public static MIN_RAFFLE_TIME: number = 60
    public static MAX_RAFFLE_TIME: number = 60 * 60 * 24 * 60
    public static MAX_RAFFLE_WINNER: number = 20

    public static MIN_SURVEY_TIME: number = 60
    public static MAX_SURVEY_TIME: number = 60 * 60 * 24 * 15

    public static COOLDOWN_TIME: number = 5

    public static UPDATE_INTERVAL: number = 1000 * 60 * 5

    public static ALLOWED_TIME_TYPES: string[] = ['m', 'h', 'd']

    public static ANSWER_REGEX: RegExp = /\[(.*?)]/g
    public static ANSWER_REPLACE_REGEX: RegExp = /[\[\]]/g
    public static QUESTION_REGEX: RegExp = /{(.*?)}/g
    public static QUESTION_REPLACE_REGEX: RegExp = /[{}]/g

    public static MAX_ANSWER_LENGTH: number = 5

    public static LETTERS: ILetter[] = [
        {
            name: 'a',
            emoji: '🇦'
        },
        {
            name: 'b',
            emoji: '🇧'
        },
        {
            name: 'c',
            emoji: '🇨'
        },
        {
            name: 'd',
            emoji: '🇩'
        },
        {
            name: 'e',
            emoji: '🇪'
        }
    ] //allowed letters

    public static PREFIX_COMMAND = '>>prefix'

    public static TOP_GG_URL: string = 'top.gg'
    public static DISCORD_BOTS_GG_URL: string = 'discord.bots.gg'

}

const DOMAIN = 'asena.xyz'
export const URLMap = {
    INVITE: `https://invite.${DOMAIN}`,
    SUPPORT_SERVER: `https://dc.${DOMAIN}`,
    WIKI: `https://wiki.${DOMAIN}`,
    WEBSITE: `https://${DOMAIN}`,
    GITHUB: `https://dev.${DOMAIN}`,
    VOTE: 'https://top.gg/bot/716259870910840832/vote'
}

export default Constants
