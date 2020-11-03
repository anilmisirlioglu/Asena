import { Message, MessageEmbed } from 'discord.js'

import Command from '../Command'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class Help extends Command{

    constructor(){
        super({
            name: 'help',
            aliases: ['yardim', 'yardım'],
            description: 'Komutlar hakkında bilgi verir.',
            usage: null,
            permission: undefined
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const command: undefined | string = args[0]
        const prefix = (await client.servers.get(message.guild.id)).prefix
        if(!args[0]){
            const text = client.getCommandHandler().getCommandsArray().map(command => {
                const label = `\`${command.name}\`: ${command.description}`
                return command.permission === 'ADMINISTRATOR' ? (
                    message.member.hasPermission('ADMINISTRATOR') ? label : undefined
                ) : label
            }).filter(Boolean).join('\n')

            const embed = new MessageEmbed()
                .setAuthor('📍 Komut Yardımı', message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                .addField('Komutlar', text)
                .addField(`🌟 Daha Detaylı Yardım?`, `${prefix}help [komut-adı]`)
                .addField(`🌐 Daha Fazla Bilgi?`, '**[Website](https://asena.xyz)**')
                .setColor('RANDOM')

            message.author.createDM().then(channel => {
                channel.send({ embed }).then(() => {
                    message.channel.send(`<@${message.author.id}> yardım menüsünü DM kutunuza gönderildi.`).then($message => {
                        $message.delete({ timeout: 2000 }).then(() => {
                            message.delete();
                        })
                    })
                }).catch(() => message.channel.send({ embed }))
            })

            return true
        }else{
            const searchCommand: Command | undefined = client.getCommandHandler().getCommandsMap().filter($command => $command.name === command.trim()).first()
            let embed
            if(searchCommand){
                embed = new MessageEmbed()
                    .setAuthor('📍 Komut Yardımı', message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                    .addField('Komut', `${prefix}${searchCommand.name}`)
                    .addField('Takma Adları (Alias)', searchCommand.aliases.map(alias => `${prefix}${alias}`))
                    .addField('Açıklaması', `${searchCommand.description}`)
                    .addField('Min. Yetki Seviyesi', `${searchCommand.permission === 'ADMINISTRATOR' ? 'Admin' : 'Üye'}`)
                    .addField('Kullanımı', `${prefix}${searchCommand.name} ${searchCommand.usage ? searchCommand.usage : ''}`)
                    .setColor('GREEN')
            }

            await message.channel.send({ embed: embed ?? this.getErrorEmbed(`**${command}** adında komut bulunamadı.`) })
            return true
        }
    }
}
