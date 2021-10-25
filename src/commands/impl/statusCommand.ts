import { Context } from '../../context';
import { ErrorMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

export class StatusCommand implements Command {
    constructor(private context: Context) {

    }

    async process(message: Message): Promise<Command | undefined> {
        const event = await this.context.events.getEvent(message.chat.id);
        if (!event) {
            await this.context.output.sendError(message.chat.id, ErrorMessage.NoEvent);
            return undefined;
        }

        this.context.output.sendEvent(message.chat.id, event);
        return undefined;
    }
}