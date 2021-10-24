import { Context } from '../../context';
import { EventState } from '../../event/event';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

export class FinishCommand implements Command {
    constructor(private context: Context) {

    }

    async process(message: Message): Promise<Command | undefined> {
        const event = await this.context.events.getEvent(message.chat.id);
        if (!event) {
            await this.context.output.sendError(message.chat.id, ErrorMessage.NoEvent);
            return undefined;
        }

        if (event.getOwner() !== message.from.getId()) {
            await this.context.output.sendError(message.chat.id, ErrorMessage.PermissionDenied);
            return undefined;
        }

        if (event.getState() !== EventState.Launched) {
            await this.context.output.sendError(message.chat.id, ErrorMessage.EventIsNotLaunched);
            return undefined;
        }
 
        await this.context.events.removeEvent(event.getId());
        await this.context.output.sendInfo(message.chat.id, InfoMessage.EventFinished);

        return undefined;
    }
}