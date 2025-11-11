import { Context } from '../../context';
import { EventState } from '../../event/event';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';
import { CommandUtils } from './commandUtils';

/**
 * Finishes launched command, so the new one can be 
 * created in the same chat
 */
export class FinishCommand implements Command {
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

        if (event.getState() !== EventState.Launched) {
            this.context.output.sendError(message.chat.id, ErrorMessage.EventIsNotLaunched);
            return Promise.resolve(undefined);
        }
 
        this.context.events.removeEvent(event.getId());
        this.context.output.sendInfo(message.chat.id, InfoMessage.EventFinished);

        return Promise.resolve(undefined);
    }
}