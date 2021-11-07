import { Context } from '../../context';
import { Command } from '../command';
import { CommandsFactory } from '../commandsFactory';
import { BlankCommand } from './blankCommand';
import { CancelCommand } from './cancelCommand';
import { CreateCommand } from './createCommand';
import { FinishCommand } from './finishCommand';
import { HelpCommand } from './helpCommand';
import { LaunchCommand } from './launchCommand';
import { ResetWishlistCommand } from './resetWishlistCommand';
import { StatusCommand } from './statusCommand';
import { WishlistCommand } from './wishlistCommand';

export class CommandsFactoryImpl implements CommandsFactory {
    constructor(private context: Context) {

    }

    createCommand(name: string | undefined): Command {
        switch (name) {
            case '/start':
            case '/help':
                return new HelpCommand(this.context);
            case '/create':
                return new CreateCommand(this.context);
            case '/finish':
                return new FinishCommand(this.context);
            case '/cancel':
                return new CancelCommand(this.context);
            case '/status':
                return new StatusCommand(this.context);
            case '/launch':
                return new LaunchCommand(this.context);
            case '/wishlist':
                return new WishlistCommand(this.context);
            case '/reset_wishlist':
                return new ResetWishlistCommand(this.context);
        }
        return new BlankCommand(this.context);
    }
}