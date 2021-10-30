
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { InfoMessage, OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { CommandsFactoryImpl } from '../../src/commands/impl/commandsFactoryImpl';
import { Context } from '../../src/context';
import { Command } from '../../src/commands/command';

describe('HelpCommand', () => {
    const chatId = 42;
    const title = 'Some group';

    const user = sinon.stubInterface<User>();
    const users = sinon.stubInterface<UsersManager>();
    const events = sinon.stubInterface<EventsManager>();
    const output = sinon.stubInterface<OutputManager>();

    const context: Context = {
        users: users,
        events: events,
        output: output
    };

    afterEach(() => {
        sinon.default.reset();
    });

    function performTest(command: Command): void {
        command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: ''
        });

        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.Help);
    }

    it('should send help message on /start', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/start');
        performTest(command);
    });

    it('should send help message on /help', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/help');
        performTest(command);
    });
    
    it('should send help message on undefined command', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand(undefined);
        performTest(command);
    });
});