import Pool from '../utils/Pool';
import { GenericInteraction } from './Interaction';
import SurveyInteraction from './actions/SurveyInteraction';
import LocaleInteraction from './actions/LocaleInteraction';

export default class InteractionPool extends Pool<GenericInteraction>{

    protected toMultidimensionalArray(): GenericInteraction[][]{
        return [
            this.ButtonInteractions,
            this.SelectMenuInteractions
        ];
    }

    private readonly ButtonInteractions = [
        new SurveyInteraction()
    ]

    private readonly SelectMenuInteractions = [
        new LocaleInteraction()
    ]

}
