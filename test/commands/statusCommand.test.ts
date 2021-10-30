
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { ErrorMessage, OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { CommandsFactoryImpl } from '../../src/commands/impl/commandsFactoryImpl';
import { Context } from '../../src/context';
import { Event } from '../../src/event/event';

describe('CreateCommand', () => {
    const any = sinon.default.match.any;
    const chatId = 42;
    const title = 'Some group';

    const user = sinon.stubInterface<User>();
    const event = sinon.stubInterface<Event>();
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

    it('should send event message', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/status');
        
        events.getEvent.withArgs(chatId).returns(event);

        command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: ''
        });

        expect(output.sendEvent.called).to.be.true;
        expect(output.sendEvent.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendEvent.lastCall.args[1]).to.be.equal(event);
    });

    it('should check that event exists', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/status');
        
        events.getEvent.withArgs(chatId).returns(undefined);

        command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: ''
        });

        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.NoEvent);
    });
});