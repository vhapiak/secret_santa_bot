import { Context } from '../../context';
import { ErrorMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

/**
 * Sends current status of Secret Santa event
 */
export class StatusCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Promise<Command | undefined> {
        const event = this.context.events.getEvent(message.chat.id);
        if (!event) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NoEvent);
            return Promise.resolve(undefined);
        }

        this.context.output.sendEvent(message.chat.id, event);
        return Promise.resolve(undefined);
    }
}