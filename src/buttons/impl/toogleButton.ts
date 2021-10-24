import { Context } from '../../context';
import { EventState } from '../../event/event';
import { ResponseMessage } from '../../output/outputManager';
import { Button, Request } from '../button';

export class ToogleButton implements Button {
    constructor(private context: Context) {

    }

    async process(request: Request): Promise<void> {
        const event = await this.context.events.getEvent(request.chatId);
        if (!event) {
            await this.context.output.responseOnClick(request.id, ResponseMessage.EventCanceled);
            await this.context.output.cancelEvent(request.chatId, request.messageId);
            return;
        }

        if (event.getState() === EventState.Launched) {
            await this.context.output.responseOnClick(request.id, ResponseMessage.AlreadyLaunched);
            await this.context.output.updateEvent(request.chatId, request.messageId, event);
            return;
        }

        const joined = await event.toogleParticipant(request.from.getId());
        await this.context.output.responseOnClick(
            request.id, 
            joined ? ResponseMessage.EventJoined : ResponseMessage.EventLeft);
        await this.context.output.updateEvent(request.chatId, request.messageId, event);
    }
}