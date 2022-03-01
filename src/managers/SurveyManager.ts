import Manager from './Manager';
import { Snowflake } from 'discord.js';
import Survey from '../structures/Survey';
import SurveyModel, { ISurvey } from '../models/Survey';

export default class SurveyManager extends Manager<Snowflake, Survey, typeof SurveyModel, ISurvey>{

    constructor(){
        super(SurveyModel)
    }

    protected key(): string{
        return 'message_id'
    }

    protected new(data: ISurvey): Survey{
        return new Survey(data)
    }

}