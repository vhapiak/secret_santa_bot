import { Context } from '../../context';
import { ErrorMessage } from '../../output/outputManager';
import { Command, Message } from '../command';

/**
 * Print current user whish list
 */
export class GetWishlistCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Command | undefined {
        if (!message.chat.private) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NotPrivateChat);
            return undefined;
        }
        this.context.output.sendWishlist(message.chat.id, message.from);
        return undefined;
    }
}