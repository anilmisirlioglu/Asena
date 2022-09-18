import { Emojis, URLMap } from '../Constants';
import Server from '../structures/Server';

const validateGiveawayText = (server: Server, text: string) => {
    return `${Emojis.CONFETTI_REACTION_EMOJI} **${server.translate('structures.giveaway.messages.finish')}** ${Emojis.CONFETTI_REACTION_EMOJI}` !== text
}

const parseGiveawayTimerURL = (start: Date, length: number): string => {
    return `${URLMap.WEBSITE}/giveaway?start=${+start}&length=${length}`
}

export {
    validateGiveawayText,
    parseGiveawayTimerURL
}
