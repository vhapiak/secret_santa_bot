import { Context } from '../../context';
import { Command } from '../command';
import { CommandsFactory } from '../commandsFactory';
import { CreateCommand } from './createCommand';
import { FinishCommand } from './finishCommand';
import { HelpCommand } from './helpCommand';

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
        }
        return new HelpCommand(this.context);
    }
}