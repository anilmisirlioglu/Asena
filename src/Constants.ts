import { EmojiResolvable } from 'discord.js';

export type Letter = 'a' | 'b' | 'c' | 'd' | 'e'

export interface ILetter{
    name: Letter,
    emoji: EmojiResolvable
}

abstract class Constants{

    public static GRAPH_EMOJI: string = '<:graph:716972905841426453>'
    public static CONFETTI_EMOJI: string = '<a:uwu:716956121289588736>' //<:confetti:713087026051940512>
    public static CONFETTI_REACTION_EMOJI: string = '\uD83C\uDF89'
    public static AGREE_EMOJI_ID: string = '721180088686870549'
    public static DISAGREE_EMOJI_ID: string = '721179958378233887'
    public static RUBY_EMOJI: string = '<a:ruby:721700215190454344>'

    public static PERMITTED_ROLE_NAME: string = 'asena' // if there is no permission, this role is checked

    public static MIN_RAFFLE_TIME: number = 60
    public static MAX_RAFFLE_TIME: number = 60 * 60 * 24 * 60
    public static MAX_RAFFLE_WINNER: number = 20

    public static MIN_SURVEY_TIME: number = 60
    public static MAX_SURVEY_TIME: number = 60 * 60 * 24 * 7

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

}

export default Constants
export { Constants }