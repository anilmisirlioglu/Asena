import { readdirSync } from 'fs'
import ascii from 'ascii-table'
import { Command } from '../commands/Command'

import { CancelRaffle } from '../commands/admin/CancelRaffle';
import { CreateRaffle } from '../commands/admin/CreateRaffle';
import { ReRollRaffle } from '../commands/admin/ReRollRaffle';
import { EndRaffle } from '../commands/admin/EndRaffle';
import { Raffles } from '../commands/public/Raffles';
import { Help } from '../commands/public/Help';
import { Vote } from '../commands/admin/Vote';
import { SetupRaffle } from '../commands/admin/SetupRaffle';

export class CommandHandler{

    private readonly table: ascii
    private static readonly COMMANDS: Command[] = [
        new CancelRaffle(),
        new CreateRaffle(),
        new ReRollRaffle(),
        new SetupRaffle(),
        new EndRaffle(),
        new Raffles(),
        new Vote(),
        new Help()
    ]

    public constructor(client){
        // noinspection JSPotentiallyInvalidConstructorUsage
        this.table = new ascii('Komutlar')
        this.table.setHeading('Komut', 'Yükleme Durumu')

        CommandHandler.COMMANDS.forEach(command => {
            client.commands.set(command.getName(), command);
            this.table.addRow(command.getName(), '✅');

            if(command.getAliases() && Array.isArray(command.getAliases())){
                command.getAliases().forEach(alias => client.aliases.set(alias, command.getName()));
            }
        })

        // BURAYI YAPAMADIK A
        /*readdirSync(`${__dirname}/../commands/`).forEach(dir => {
            if(!dir.endsWith('.ts') && !dir.endsWith('.js') && !dir.endsWith('.js.map')){
                const commands = readdirSync(`${__dirname}/../commands/${dir}/`).filter(file => file.endsWith('.ts'));

                for(const file of commands){
                    (async () => {
                        //console.log(file.replace('ts', 'js'))
                        await import(`${__dirname}/../commands/${dir}/${file.replace('ts', 'js')}`).then(push => {
                            const command = push.default
                            if(command.getName()){
                                client.commands.set(command.getName(), command);
                                this.table.addRow(file, '✅');
                            }else{
                                this.table.addRow(file, '❌  -> help.name eksik veya string tipinde değil.')
                            }

                            if(command.getAliases() && Array.isArray(command.getAliases())){
                                command.getAliases().forEach(alias => client.aliases.set(alias, command.getName()));
                            }
                        })
                    })()
                }
            }
        })*/

        //client.logger.info('\n' + table.toString());
        console.log(this.table.toString());
    }
}