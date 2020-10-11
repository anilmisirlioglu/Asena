import { EmojiResolvable, PermissionString } from 'discord.js';

export type Letter = 'a' | 'b' | 'c' | 'd' | 'e'

export interface ILetter{
    name: Letter,
    emoji: EmojiResolvable
}

interface IRaffleLimits{
    readonly MIN_TIME: number
    readonly MAX_TIME: number
    readonly MAX_WINNER_COUNT: number
    readonly MAX_COUNT: number
    readonly MAX_COUNT_PREMIUM: number
    readonly MAX_SERVER_COUNT: number
    readonly MAX_ALLOWED_ROLE_COUNT: number
    readonly MAX_REWARD_ROLE_COUNT: number
}

export const RaffleLimits: IRaffleLimits = {
    MIN_TIME: 60,
    MAX_TIME: 60 * 60 * 24 * 60,
    MAX_WINNER_COUNT: 20,
    MAX_COUNT: 5,
    MAX_COUNT_PREMIUM: 8,
    MAX_SERVER_COUNT: 3,
    MAX_ALLOWED_ROLE_COUNT: 10,
    MAX_REWARD_ROLE_COUNT: 8
}

export const SETUP_CANCEL_KEYWORDS: string[] = ['iptal', 'cancel', 'exit']
export const PHASE_SKIP_KEYWORDS: string[] = ['pas', 'skip', 'geç', 'gec']

abstract class Constants{

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
    public static RUBY_EMOJI: string = '<a:ruby:721700215190454344>'

    public static PERMITTED_ROLE_NAME: string = 'asena' // if there is no permission, this role is checked

    public static MIN_SURVEY_TIME: number = 60
    public static MAX_SURVEY_TIME: number = 60 * 60 * 24 * 15

    public static COOLDOWN_TIME: number = 5

    public static ALLOWED_TIME_TYPES: string[] = ['m', 'h', 'd']

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

export default Constants
