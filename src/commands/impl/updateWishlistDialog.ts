import { Context } from '../../context';
import { InfoMessage } from '../../output/outputManager';
import { Command, Message } from '../command';
import { CommandUtils } from './commandUtils';

export class UpdateWhishlistDialog implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Command | undefined {
        const user = message.from;
        if (message.data.length === 0) {
            user.setWitshlist(undefined);
        } else {
            user.setWitshlist(message.data);
        }
        this.context.output.sendInfo(message.chat.id, InfoMessage.WishlistUpdated);

        CommandUtils.sendWhishlistUpdate(user, this.context);

        return undefined;
    }
}