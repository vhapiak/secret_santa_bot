import { Context } from '../../context';
import { Command } from '../command';
import { CommandsFactory } from '../commandsFactory';
import { CancelCommand } from './cancelCommand';
import { CreateCommand } from './createCommand';
import { FinishCommand } from './finishCommand';
import { HelpCommand } from './helpCommand';
import { LaunchCommand } from './launchCommand';
import { StatusCommand } from './statusCommand';

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
        }
        return new HelpCommand(this.context);
    }
}