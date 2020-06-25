import { Command } from '../Command';
import { SuperClient } from '../../Asena';
import { Message, MessageEmbed } from 'discord.js';
import Constants, { ILetter } from '../../Constants';
import regional from '../../utils/RegionalIndicator';

export default class Question extends Command{

    constructor(){
        super({
            name: 'question',
            aliases: ['sorusor', 'soru'],
            description: 'Sunucuya bir soru sorarsınız.',
            usage: '{soru} ...[şıklar]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        if(args.length < 2) return false

        const content = args.join(' ')

        const questions = (content.match(Constants.QUESTION_REGEX) || []).map(item => {
            return item.replace(Constants.QUESTION_REPLACE_REGEX, '')
        })
        const answers = (content.match(Constants.ANSWER_REGEX) || []).map(item => {
            return item.replace(Constants.ANSWER_REPLACE_REGEX, '')
        })

        const question = questions.shift()
        if(!question || answers.length === 0) return false

        if(questions.length !== 0){
             await message.channel.send({
                embed: this.getErrorEmbed('Birden fazla soru yazamazsınız. Lütfen tek bir soru yazarak tekrar deneyin.')
            })

            return true
        }

        if(answers.length > Constants.MAX_ANSWER_LENGTH){
            await message.channel.send({
                embed: this.getErrorEmbed(`Sorunuza maksimum ${Constants.MAX_ANSWER_LENGTH} adet şık ekleyebilirsiniz.`)
            })

            return true
        }

        let i: number = 0
        const emojis: ILetter[] = []
        const embed = new MessageEmbed()
            .setTitle(question)
            .setDescription(
                answers
                    .map(answer => {
                        const emoji = Constants.LETTERS[i++]
                        emojis.push(emoji)

                        return `${regional`${emoji.name}`} ${answer}`
                    })
                    .join('\n\n')
            )
            .setColor('#5DADE2')

        message.channel
            .send({ embed })
            .then(vote => {
                emojis.map(item => vote.react(item.emoji))
            })
            .catch(async () => {
                await message.channel.send(':boom: Soru sohbet kanalına bir sebepten dolayı gönderilemedi.')
            })

        await message.delete({
            timeout: 0
        })

        return true
    }

}