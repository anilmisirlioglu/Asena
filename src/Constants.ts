type Subscription = 'ON_RAFFLE_FINISHED'

abstract class Constants{

    public static GRAPH_EMOJI: string = '<:graph:716972905841426453>'
    public static CONFETTI_EMOJI: string = '<a:uwu:716956121289588736>' //<:confetti:713087026051940512>
    public static CONFETTI_REACTION_EMOJI: string = '\uD83C\uDF89'
    public static AGREE_EMOJI_ID: string = '721180088686870549'
    public static DISAGREE_EMOJI_ID: string = '721179958378233887'
    public static RUBY_EMOJI: string = '<a:ruby:721700215190454344>'

    public static SUBSCRIPTIONS: {
        [key: string]: Subscription
    } = {
        ON_RAFFLE_FINISHED: 'ON_RAFFLE_FINISHED'
    }

    public static MIN_TIME: number = 60
    public static MAX_TIME: number = 60 * 60 * 24 * 60
    public static MAX_WINNER: number = 20

    public static ALLOWED_TIME_TYPES: string[] = ['m', 'h', 'd']

}

export default Constants
export { Constants }