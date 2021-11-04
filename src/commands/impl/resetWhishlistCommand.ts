import { Context } from '../../context';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';
import { CommandUtils } from './commandUtils';

export class ResetWishlistCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Command | undefined {
        if (!message.chat.private) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NotPrivateChat);
            return undefined;
        }
        message.from.setWitshlist(undefined);
        this.context.output.sendInfo(message.chat.id, InfoMessage.WishlistReset);
        CommandUtils.sendWhishlistUpdate(message.from, this.context);
        return undefined;
    }
}