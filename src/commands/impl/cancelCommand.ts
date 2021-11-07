import { Context } from '../../context';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

/**
 * Cancels command, so the new one can be 
 * created in the same chat. Users will receive 
 * notifications about cancellation.
 */
export class CancelCommand implements Command {
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

        event.getParticipants().forEach(participant => {
            const user = this.context.users.getUser(participant.user);
            const chatId = user?.getChatId();
            if (chatId) {
                this.context.output.sendEventCancellation(chatId, event);
            }
        });
 
        this.context.events.removeEvent(event.getId());
        this.context.output.sendInfo(message.chat.id, InfoMessage.EventCanceled);

        return undefined;
    }
}