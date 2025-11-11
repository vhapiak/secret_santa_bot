import { Context } from '../../context';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';
import { CommandUtils } from './commandUtils';

/**
 * Updates event budget
 */
export class UpdateBudget implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Promise<Command | undefined> {
        if (message.args.length === 0) {
            this.context.output.sendError(message.chat.id, ErrorMessage.ArgumentExpected);
            return Promise.resolve(undefined);
        }

        const event = this.context.events.getEvent(message.chat.id);
        if (!event) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NoEvent);
            return Promise.resolve(undefined);
        }

        if (event.getOwner() !== message.from.getId()) {
            this.context.output.sendError(message.chat.id, ErrorMessage.PermissionDenied);
            return Promise.resolve(undefined);
        }

        event.setBudget(message.args.join(' '));
        this.context.output.sendInfo(message.chat.id, InfoMessage.BudgetUpdated);
        this.context.output.sendEvent(message.chat.id, event);

        return Promise.resolve(undefined);
    }
}