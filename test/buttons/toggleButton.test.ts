
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { OutputManager, ResponseMessage } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { Context } from '../../src/context';
import { Event, EventState } from '../../src/event/event';
import { ButtonsFactoryImpl } from '../../src/buttons/impl/buttonsFactoryImpl';
import { Button } from '../../src/buttons/button';

describe('ToggleButton', () => {
    const requestId = 'request';
    const chatId = 42;
    const messageId = 142;
    const userId = 13;

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

    it('should add participant to event', () => {
        const factory = new ButtonsFactoryImpl(context);
        const button = factory.createButton('toggle') as Button;
        
        events.getEvent.withArgs(chatId).returns(event);
        event.getState.returns(EventState.Registering);
        event.toggleParticipant.returns(true);
        user.getId.returns(userId);

        button.onClick({
            id: requestId,
            from: user,
            chatId: chatId,
            messageId: messageId
        });

        expect(event.toggleParticipant.called).to.be.true;
        expect(event.toggleParticipant.lastCall.args[0]).to.be.equal(user);

        expect(output.updateEvent.called).to.be.true;
        expect(output.updateEvent.lastCall.args[0]).to.be.equal(chatId);
        expect(output.updateEvent.lastCall.args[1]).to.be.equal(messageId);
        expect(output.updateEvent.lastCall.args[2]).to.be.equal(event);

        expect(output.responseOnClick.called).to.be.true;
        expect(output.responseOnClick.lastCall.args[0]).to.be.equal(requestId);
        expect(output.responseOnClick.lastCall.args[1]).to.be.equal(ResponseMessage.EventJoined);
    });

    it('should remove participant from event', () => {
        const factory = new ButtonsFactoryImpl(context);
        const button = factory.createButton('toggle') as Button;
        
        events.getEvent.withArgs(chatId).returns(event);
        event.getState.returns(EventState.Registering);
        event.toggleParticipant.returns(false);
        user.getId.returns(userId);

        button.onClick({
            id: requestId,
            from: user,
            chatId: chatId,
            messageId: messageId
        });

        expect(event.toggleParticipant.called).to.be.true;
        expect(event.toggleParticipant.lastCall.args[0]).to.be.equal(user);

        expect(output.updateEvent.called).to.be.true;
        expect(output.updateEvent.lastCall.args[0]).to.be.equal(chatId);
        expect(output.updateEvent.lastCall.args[1]).to.be.equal(messageId);
        expect(output.updateEvent.lastCall.args[2]).to.be.equal(event);

        expect(output.responseOnClick.called).to.be.true;
        expect(output.responseOnClick.lastCall.args[0]).to.be.equal(requestId);
        expect(output.responseOnClick.lastCall.args[1]).to.be.equal(ResponseMessage.EventLeft);
    });

    it('should replace message for canceled', () => {
        const factory = new ButtonsFactoryImpl(context);
        const button = factory.createButton('toggle') as Button;
        
        events.getEvent.withArgs(chatId).returns(undefined);

        button.onClick({
            id: requestId,
            from: user,
            chatId: chatId,
            messageId: messageId
        });

        expect(output.cancelEvent.called).to.be.true;
        expect(output.cancelEvent.lastCall.args[0]).to.be.equal(chatId);
        expect(output.cancelEvent.lastCall.args[1]).to.be.equal(messageId);

        expect(output.responseOnClick.called).to.be.true;
        expect(output.responseOnClick.lastCall.args[0]).to.be.equal(requestId);
        expect(output.responseOnClick.lastCall.args[1]).to.be.equal(ResponseMessage.EventCanceled);
    });

    it('should prevent modification of launched event', () => {
        const factory = new ButtonsFactoryImpl(context);
        const button = factory.createButton('toggle') as Button;
        
        events.getEvent.withArgs(chatId).returns(event);
        event.getState.returns(EventState.Launched);

        button.onClick({
            id: requestId,
            from: user,
            chatId: chatId,
            messageId: messageId
        });

        expect(output.updateEvent.called).to.be.true;
        expect(output.updateEvent.lastCall.args[0]).to.be.equal(chatId);
        expect(output.updateEvent.lastCall.args[1]).to.be.equal(messageId);
        expect(output.updateEvent.lastCall.args[2]).to.be.equal(event);

        expect(output.responseOnClick.called).to.be.true;
        expect(output.responseOnClick.lastCall.args[0]).to.be.equal(requestId);
        expect(output.responseOnClick.lastCall.args[1]).to.be.equal(ResponseMessage.AlreadyLaunched);
    });
});