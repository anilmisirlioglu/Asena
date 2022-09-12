import Pool from '../utils/Pool';
import { GenericInteraction } from './Interaction';
import SurveyInteraction from './actions/SurveyInteraction';
import LocaleInteraction from './actions/LocaleInteraction';
import GiveawayInteraction from './actions/GiveawayInteraction';
import GeneralInteraction from './actions/GeneralInteraction';

export default class InteractionPool extends Pool<GenericInteraction>{

    protected toMultidimensionalArray(): GenericInteraction[][]{
        return [
            this.ButtonInteractions,
            this.SelectMenuInteractions
        ];
    }

    private readonly ButtonInteractions = [
        new SurveyInteraction(),
        new GiveawayInteraction(),
        new GeneralInteraction()
    ]

    private readonly SelectMenuInteractions = [
        new LocaleInteraction()
    ]

}
