import { readdirSync } from 'fs'
import ascii from 'ascii-table'
import {Command} from "../commands/Command";

export class CommandHandler{

    private readonly table: ascii

    public constructor(client) {
        // noinspection JSPotentiallyInvalidConstructorUsage
        this.table = new ascii('Komutlar')
        this.table.setHeading('Komut', 'Yükleme Durumu')

        readdirSync(`${__dirname}/../commands/`).forEach(dir => {
            if(!dir.endsWith('.ts')){
                const commands = readdirSync(`${__dirname}/../commands/${dir}/`).filter(file => file.endsWith('.ts'));

                for(const file of commands){
                    const pull: Command = require(`${__dirname}/../commands/${dir}/${file}`);

                    if(pull.getName()){
                        client.commands.set(pull.getName(), pull);
                        this.table.addRow(file, '✅');
                    }else{
                        this.table.addRow(file, '❌  -> help.name eksik veya string tipinde değil.')
                    }

                    if(pull.getAliases() && Array.isArray(pull.getAliases()))
                        pull.getAliases().forEach(alias => client.aliases.set(alias, pull.getName()));
                }
            }
        })

        //client.logger.info('\n' + table.toString());
        console.log(this.table.toString());
    }
}