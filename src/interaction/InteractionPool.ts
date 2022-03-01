import Pool from '../utils/Pool';
import { GenericInteraction } from './Interaction';
import SurveyInteraction from './actions/SurveyInteraction';

export default class InteractionPool extends Pool<GenericInteraction>{

    private readonly ButtonInteractions = [
        new SurveyInteraction()
    ]

    protected toMultidimensionalArray(): GenericInteraction[][]{
        return [
            this.ButtonInteractions
        ];
    }

}
