import ApplicationCommand from '../ApplicationCommand';

export default class Raffles extends ApplicationCommand{

    build(){
        this.setName('giveaways')
        this.setDescription('Returns the on going giveaways list')
        this.setDescriptionLocalizations({ tr: 'Sunucu içerisinde devam eden çekilişlerin listesini döndürür' })
    }

}