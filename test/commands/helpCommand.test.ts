
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
    const any = sinon.default.match.any;
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

    async function performTest(command: Command): Promise<void> {
        await command.process({
            from: user,
            chat: {
                id: chatId,
                title: title
            },
            data: ''
        });

        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.Help);
    }

    it('should send help message on /start', async () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/start');
        await performTest(command);
    });

    it('should send help message on /help', async () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/help');
        await performTest(command);
    });
    
    it('should send help message on undefined command', async () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand(undefined);
        await performTest(command);
    });
});