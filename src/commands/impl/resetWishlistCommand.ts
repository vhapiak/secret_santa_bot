import { Context } from '../../context';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';
import { CommandUtils } from './commandUtils';

/**
 * Removes user current wishlist
 */
export class ResetWishlistCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Promise<Command | undefined> {
        if (!message.chat.private) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NotPrivateChat);
            return Promise.resolve(undefined);
        }
        message.from.setWishlist(undefined);
        this.context.output.sendInfo(message.chat.id, InfoMessage.WishlistReset);
        CommandUtils.sendWishlistUpdate(message.from, this.context);
        return Promise.resolve(undefined);
    }
}