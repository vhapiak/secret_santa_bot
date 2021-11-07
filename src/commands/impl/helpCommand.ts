import { Context } from '../../context';
import { InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

/**
 * Bot description and commands
 */
export class HelpCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Command | undefined {
        this.context.output.sendInfo(message.chat.id, InfoMessage.Help);
        return undefined;
    }
}