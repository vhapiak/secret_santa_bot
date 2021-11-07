
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { CommandsFactoryImpl } from '../../src/commands/impl/commandsFactoryImpl';
import { Context } from '../../src/context';

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

    it('should do nothing', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand(undefined);
        command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: ''
        });

        expect(output.cancelEvent.called).to.be.false;
        expect(output.responseOnClick.called).to.be.false;
        expect(output.sendError.called).to.be.false;
        expect(output.sendEvent.called).to.be.false;
        expect(output.sendEventCancellation.called).to.be.false;
        expect(output.sendInfo.called).to.be.false;
        expect(output.sendTarget.called).to.be.false;
        expect(output.sendWishlistUpdate.called).to.be.false;
        expect(output.updateEvent.called).to.be.false;
    });
});