
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { ErrorMessage, InfoMessage, OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { CommandsFactoryImpl } from '../../src/commands/impl/commandsFactoryImpl';
import { Context } from '../../src/context';
import { Event, EventState } from '../../src/event/event';

describe('CancelCommand', () => {
    const chatId = 42;
    const userId = 13;
    const otherId = 14;
    const title = 'Some group';
    const participants = [
        {
            user: userId
        },
        {
            user: otherId
        }
    ];

    const user = sinon.stubInterface<User>();
    const other = sinon.stubInterface<User>();
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

    it('should remove event', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/cancel');
        
        users.getUser.withArgs(userId).returns(user);
        users.getUser.withArgs(otherId).returns(other);
        events.getEvent.withArgs(chatId).returns(event);
        event.getId.returns(chatId);
        event.getOwner.returns(userId);
        event.getParticipants.returns(participants);

        user.getId.returns(userId);
        user.getChatId.returns(userId);
        other.getChatId.returns(undefined);

        command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: ''
        });

        expect(events.removeEvent.called).to.be.true;
        expect(events.removeEvent.lastCall.args[0]).to.be.equal(chatId);

        expect(output.sendEventCancellation.called).to.be.true;
        expect(output.sendEventCancellation.lastCall.args[0]).to.be.equal(userId);
        expect(output.sendEventCancellation.lastCall.args[1]).to.be.equal(event);

        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.EventCanceled);
    });

    it('should check that event is present in chat', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/cancel');
        
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

    it('should check that command called by event owner', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/cancel');
        
        events.getEvent.withArgs(chatId).returns(event);
        event.getOwner.returns(userId + 1);
        user.getId.returns(userId);

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
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.PermissionDenied);
    });
});