import { Context } from '../../context';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';
import { CommandUtils } from './commandUtils';

/**
 * Cancels command, so the new one can be 
 * created in the same chat. Users will receive 
 * notifications about cancellation.
 */
export class CancelCommand implements Command {
    constructor(private context: Context) {

    }

    async process(message: Message): Promise<Command | undefined> {
        const event = this.context.events.getEvent(message.chat.id);
        if (!event) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NoEvent);
            return Promise.resolve(undefined);
        }

        const canManageEvent = await CommandUtils.canManageEvent(message.from, event, this.context.service);
        if (!canManageEvent) {
            this.context.output.sendError(message.chat.id, ErrorMessage.PermissionDenied);
            return Promise.resolve(undefined);
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

        return Promise.resolve(undefined);
    }
}