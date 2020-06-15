import { Message } from "discord.js";

export default interface CommandRunner{

    run(message: Message): void

}