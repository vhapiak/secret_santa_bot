import { Context } from '../../context';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';
import { UpdateWishlistDialog } from './updateWishlistDialog';

/**
 * Switches command processing mode to wishlist waiting
 */
export class WishlistCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Promise<Command | undefined> {
        if (!message.chat.private) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NotPrivateChat);
            return Promise.resolve(undefined);
        }
        this.context.output.sendInfo(message.chat.id, InfoMessage.WaitingForWishlist);
        return Promise.resolve(new UpdateWishlistDialog(this.context));
    }
}