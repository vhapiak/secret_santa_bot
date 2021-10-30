import { Context } from '../../context';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';
import { UpdateWhishlistDialog } from './updateWishlistDialog';

export class WishlistCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Command | undefined {
        if (!message.chat.private) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NotPrivateChat);
        }
        this.context.output.sendInfo(message.chat.id, InfoMessage.WaitingForWishlist);
        return new UpdateWhishlistDialog(this.context);
    }
}