import { Context } from '../../context';
import { InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

export class HelpCommand implements Command {
    constructor(private context: Context) {

    }

    async process(message: Message): Promise<Command | undefined> {
        this.context.output.sendInfo(message.chat.id, InfoMessage.Help);
        return undefined;
    }
}