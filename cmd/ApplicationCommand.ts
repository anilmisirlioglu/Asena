import { SlashCommandBuilder } from '@discordjs/builders';

export default abstract class ApplicationCommand extends SlashCommandBuilder{

    constructor(){
        super()

        this.build()
    }

    abstract build(): void

}