import { Context } from '../../context';
import { ErrorMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

export class CreateCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Command | undefined {
        if (this.context.events.getEvent(message.chat.id)) {
            this.context.output.sendError(message.chat.id, ErrorMessage.AlreadyHasEvent);
            return undefined;
        }

        const event = this.context.events.addEvent(
            message.chat.id,
            message.chat.title,
            message.from.getId());

        this.context.output.sendEvent(message.chat.id, event);

        return undefined;
    }
}