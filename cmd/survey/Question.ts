import ApplicationCommand from '../ApplicationCommand';

export default class Question extends ApplicationCommand{

    build(){
        this.setName('question')
        this.setDescription('Ask a question in guild')
        this.setDescriptionLocalizations({ tr: 'Sunucu içerisinde çok şıklı bir soru başlatır' })
        this.addStringOption(option => option
            .setName('question')
            .setNameLocalizations({ tr: 'soru' })
            .setDescription('The question you would like to ask')
            .setDescriptionLocalizations({ tr: 'Sunucuya sormak istediğiniz soru' })
            .setRequired(true)
        )
        this.addStringOption(option => option
            .setName('answers')
            .setNameLocalizations({ tr: 'şıklar' })
            .setDescription('The answers of your question (format: Answer 1|Answer 2|Answer 3)')
            .setDescriptionLocalizations({ tr: 'Sorunuzun şıkları: (format: Şık 1|Şık 2|Şık 3)' })
            .setRequired(true)
        )
    }

}