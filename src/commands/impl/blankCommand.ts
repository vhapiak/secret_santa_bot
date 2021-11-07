import { Context } from '../../context';
import { Command, Message } from '../command';

/**
 * Ignore received command
 */
export class BlankCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Command | undefined {
        return undefined;
    }
}