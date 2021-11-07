import { Context } from '../../context';
import { EventState } from '../../event/event';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

/**
 * Finishes launched command, so the new one can be 
 * created in the same chat
 */
export class FinishCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Command | undefined {
        const event = this.context.events.getEvent(message.chat.id);
        if (!event) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NoEvent);
            return undefined;
        }

        if (event.getOwner() !== message.from.getId()) {
            this.context.output.sendError(message.chat.id, ErrorMessage.PermissionDenied);
            return undefined;
        }

        if (event.getState() !== EventState.Launched) {
            this.context.output.sendError(message.chat.id, ErrorMessage.EventIsNotLaunched);
            return undefined;
        }
 
        this.context.events.removeEvent(event.getId());
        this.context.output.sendInfo(message.chat.id, InfoMessage.EventFinished);

        return undefined;
    }
}