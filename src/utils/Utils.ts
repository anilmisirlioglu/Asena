import Constants, { DOMAIN } from '../Constants';

const confEmojiLen = Constants.CONFETTI_EMOJI.length
const validateRaffleText = (text: string) => {
    text = text.trim()
    return (
        text.length >= confEmojiLen * 2 &&
        text.substr(0, confEmojiLen) == Constants.CONFETTI_EMOJI &&
        text.substr(text.length - confEmojiLen, confEmojiLen) == Constants.CONFETTI_EMOJI
    )
}

const parseGiveawayTimerURL = (start: Date, length: number): string => {
    return `https://${DOMAIN}/giveaway?start=${+start}&length=${length}`
}

export {
    validateRaffleText,
    parseGiveawayTimerURL
}
