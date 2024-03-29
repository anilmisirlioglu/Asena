import { Collection } from 'discord.js';
import Language from './Language';
import { readdirSync } from 'fs';
import { sep } from 'path';
import SuperClient from '../SuperClient';
import { Colors } from '../utils/TextFormat';

export default class LanguageManager{

    private static languages: Collection<string, Language> = new Collection()

    private static LOCALE_PATH = `${process.cwd()}${sep}locales`
    public static DEFAULT_LANGUAGE = 'tr_TR'

    constructor(private client: SuperClient){}

    init(){
        const files = readdirSync(LanguageManager.LOCALE_PATH)
        if(!files.length) this.client.logger.error('Language files not found.')

        for(const file of files){
            if(!file.endsWith('.json')){
                this.client.logger.warning(`The language file named ${file} does not end with the '.json' file extension.`)
                continue
            }

            const language = require(`${LanguageManager.LOCALE_PATH}${sep}${file}`)
            this.client.logger.info(`Language loaded: ${Colors.LIGHT_PURPLE + language.full}`)

            const locale = new Language(language)
            LanguageManager.addLanguage(locale)

            if(this.client.version.compare(locale.version) === -1){
                if(locale.code === LanguageManager.DEFAULT_LANGUAGE){
                    this.client.logger.warning(`The default language (${LanguageManager.DEFAULT_LANGUAGE}) version is out of date. Please update the language version.`)
                    process.exit(1)
                }else{
                    this.client.logger.warning(`The ${language.full} language version is out of date. Missing keys will be provided from the default language.`)
                }
            }
        }

        if(!LanguageManager.languages.get(LanguageManager.DEFAULT_LANGUAGE)){
            this.client.logger.error(`Default language (${LanguageManager.DEFAULT_LANGUAGE}) could not be loaded.`)
            process.exit(1)
        }

        this.client.logger.info(`Total ${LanguageManager.languages.size} language successfully loaded!`)
    }

    private static addLanguage(locale: Language){
        this.languages.set(locale.code, locale)
    }

    public static findLanguage(code: string): Language | null{
        return this.languages.find(lang => lang.code === code || lang.aliases.includes(code))
    }

    public static getLanguage(code: string): Language{
        return this.findLanguage(code) ?? this.languages.get(LanguageManager.DEFAULT_LANGUAGE)
    }

    public static getLanguages(): Language[]{
        return Array.from(this.languages.values())
    }

    public static translate(code: string, key: string, ...args: Array<string | number>){
        const translated = this.getLanguage(code).translate(key, args)
        if(!translated){
            return this.getLanguage(this.DEFAULT_LANGUAGE).translate(key, args)
        }

        return translated
    }

}
