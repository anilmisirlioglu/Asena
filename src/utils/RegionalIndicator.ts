import { Letter } from '../Constants';

export default function regional(strings: TemplateStringsArray, letter: Letter){
    return `:regional_indicator_${letter}:`
}