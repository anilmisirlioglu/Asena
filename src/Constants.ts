export abstract class Constants{

    public static CONFETTI_EMOJI: string = `<:confetti:713087026051940512>`
    public static CONFETTI_REACTION_EMOJI: string = '\uD83C\uDF89'

    public static SUBSCRIPTIONS = {
        ON_RAFFLE_FINISHED: 'ON_RAFFLE_FINISHED'
    }

    public static MIN_TIME: number = 60
    public static MAX_TIME: number = 60 * 60 * 24 * 120
    public static MAX_WINNER: number = 25

    public static ALLOWED_TIME_TYPES: string[] = ['m', 'h', 'd']

}