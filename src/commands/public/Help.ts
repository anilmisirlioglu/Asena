import { Message, MessageEmbed } from 'discord.js'

import { Command } from '../Command'
import { SuperClient } from '../../Asena';

export class Help extends Command{

    constructor(){
        super(
            'help',
            ['yardim', 'yardım'],
            'Komutlar hakkında bilgi verir.',
            null,
            undefined
        )
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const command: undefined | string = args[0];
        if(args[0] === undefined){
            const text = client.commands.map(command => {
                return command.getPermission() === 'ADMINISTRATOR' ? (
                    message.member.hasPermission('ADMINISTRATOR') ? `\`${command.getName()}\`` : undefined
                ) : `\`${command.getName()}\``;
            }).filter(item => item !== undefined).join(', ');

            const embed = new MessageEmbed()
                .setAuthor('📍 Komut Yardımı', message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                .addField('Komutlar', text)
                .addField(`🌟 Daha Detaylı Yardım?`, `${process.env.PREFIX}help [komut]`)
                .addField(`🌐 Daha Fazla Bilgi?`, '**[Website](https://asena.xyz)**')
                .setColor('RANDOM')

            await message.author.send({ embed });
            await message.channel
                .send(`<@${message.author.id}> yardım menüsünü DM kutunuza gönderildi.`)
                .then($message => {
                    $message.delete({ timeout: 2000 }).then(() => {
                        message.delete();
                    })
                });

            return true;
        }else{
            const searchCommand: Command | undefined = client.commands.filter($command => $command.getName() === command.trim()).first();
            if(searchCommand !== undefined){
                const embed = new MessageEmbed()
                    .setAuthor('📍 Komut Yardımı', message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                    .addField('Komut', `**${process.env.PREFIX}${searchCommand.getName()}**`)
                    .addField('Takma Adları (Alias)', searchCommand.getAliases().map(alias => {
                        return `**${process.env.PREFIX}${alias}**`
                    }).join('\n'))
                    .addField('Açıklaması', `${searchCommand.getDescription()}`)
                    .addField('Min. Yetki Seviyesi', `${searchCommand.getPermission() === 'ADMINISTRATOR' ? '**Admin**' : '**Üye**'}`)
                    .addField('Kullanımı: ', `${process.env.PREFIX}${searchCommand.getName()} ${searchCommand.getUsage() === null ? '' : searchCommand.getUsage()}`)
                    .setColor('GREEN');

                await message.channel.send({ embed });

                return true;
            }else{
                await message.channel.send({
                    embed: client.helpers.message.getErrorEmbed(`**${command}** adında komut bulunamadı.`)
                });

                return true;
            }
        }
    }
}