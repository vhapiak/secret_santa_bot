import { Context } from '../../context';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

export class CancelCommand implements Command {
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

        const participants = event.getParticipants();
        for (let i = 0; i < participants.length; ++i) {
            const user = await this.context.users.getUser(participants[i].user);
            const chatId = user?.getChatId();
            if (chatId) {
                await this.context.output.sendEventCancelation(chatId, event);
            }
        }
 
        await this.context.events.removeEvent(event.getId());
        await this.context.output.sendInfo(message.chat.id, InfoMessage.EventCanceled);

        return undefined;
    }
}