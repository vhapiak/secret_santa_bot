import { Context } from '../../context';
import { EventState } from '../../event/event';
import { ResponseMessage } from '../../output/outputManager';
import { Button, Request } from '../button';

/**
 * Toggle user participation in secret santa event
 */
export class ToggleButton implements Button {
    constructor(private context: Context) {

    }

    onClick(request: Request): void {
        const event = this.context.events.getEvent(request.chatId);
        if (!event) {
            this.context.output.responseOnClick(request.id, ResponseMessage.EventCanceled);
            this.context.output.cancelEvent(request.chatId, request.messageId);
            return;
        }

        if (event.getState() === EventState.Launched) {
            this.context.output.responseOnClick(request.id, ResponseMessage.AlreadyLaunched);
            this.context.output.updateEvent(request.chatId, request.messageId, event);
            return;
        }

        const joined = event.toggleParticipant(request.from);
        this.context.output.responseOnClick(
            request.id, 
            joined ? ResponseMessage.EventJoined : ResponseMessage.EventLeft);
        this.context.output.updateEvent(request.chatId, request.messageId, event);
    }
}