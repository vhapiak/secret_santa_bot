import { Context } from '../../context';
import { InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';
import { CommandUtils } from './commandUtils';

export class UpdateWishlistDialog implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Command | undefined {
        const user = message.from;
        if (message.data.length === 0) {
            user.setWishlist(undefined);
        } else {
            user.setWishlist(message.data);
        }
        this.context.output.sendInfo(message.chat.id, InfoMessage.WishlistUpdated);

        CommandUtils.sendWishlistUpdate(user, this.context);

        return undefined;
    }
}