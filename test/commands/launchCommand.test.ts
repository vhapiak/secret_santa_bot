
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
import { Service } from '../../src/service/service';
import { CommandUtils } from '../../src/commands/impl/commandUtils';

describe('LaunchCommand', () => {
    const chatId = 42;
    const firstUserId = 13;
    const firstChatId = 14;
    const secondUserId = 15;
    const secondChatId = 16;
    const thirdUserId = 17;
    const thirdChatId = 18;
    const title = 'Some group';
    const participants = [
        {
            user: firstUserId
        },
        {
            user: secondUserId
        },
        {
            user: thirdUserId
        }
    ];

    const first = sinon.stubInterface<User>();
    const second = sinon.stubInterface<User>();
    const third = sinon.stubInterface<User>();
    const event = sinon.stubInterface<Event>();
    const users = sinon.stubInterface<UsersManager>();
    const events = sinon.stubInterface<EventsManager>();
    const output = sinon.stubInterface<OutputManager>();

    const context: Context = {
        service: sinon.stubInterface<any>(),
        users: users,
        events: events,
        output: output
    };

    const canManageEventStub = sinon.default.stub<[User, Event, Service], Promise<boolean>>();

    before(() => {
        sinon.default.replace(CommandUtils, 'canManageEvent', canManageEventStub);
    });

    afterEach(() => {
        canManageEventStub.reset();
        sinon.default.reset();
    });

    after(() => {
        sinon.default.restore();
    });

    it('should send targets to users', async () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/launch');
        
        events.getEvent.withArgs(chatId).returns(event);
        users.getUser.withArgs(firstUserId).returns(first);
        users.getUser.withArgs(secondUserId).returns(second);
        users.getUser.withArgs(thirdUserId).returns(third);

        event.getId.returns(chatId);
        event.getState.returns(EventState.Registering);
        event.getOwner.returns(firstUserId);
        event.getParticipants.returns(participants);

        first.getId.returns(firstUserId);
        first.getChatId.returns(firstChatId);
        second.getId.returns(secondUserId);
        second.getChatId.returns(secondChatId);
        third.getId.returns(thirdUserId);
        third.getChatId.returns(thirdChatId);

        canManageEventStub.withArgs(first, event, context.service).resolves(true);
        await command.process({
            from: first,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: '',
            args: []
        });

        expect(output.sendTarget.calledThrice).to.be.true;
        expect(output.sendTarget.lastCall.args[1]).to.be.equal(event);
        const usersList: User[] = [first, second, third];
        usersList.splice(usersList.indexOf(output.sendTarget.getCall(0).args[2]), 1);
        usersList.splice(usersList.indexOf(output.sendTarget.getCall(1).args[2]), 1);
        usersList.splice(usersList.indexOf(output.sendTarget.getCall(2).args[2]), 1);
        expect(usersList.length).to.be.equal(0);

        for (let i = 0; i < 3; ++i) {
            expect(output.sendTarget.getCall(2).args[2].getChatId()).to.be.not.equal(
                output.sendTarget.getCall(2).args[0]);
        }

        expect(event.setState.called).to.be.true;
        expect(event.setState.lastCall.args[0]).to.be.equal(EventState.Launched);
        expect(event.setTarget.calledThrice).to.be.true;

        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.EventLaunched);
    });

    it('should check that event is present in chat', async () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/launch');
        
        events.getEvent.withArgs(chatId).returns(undefined);

        canManageEventStub.withArgs(first, event, context.service).resolves(true);
        await command.process({
            from: first,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: '',
            args: []
        });

        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.NoEvent);
    });

    it('should check that event is not laucnhed', async () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/launch');
        
        events.getEvent.withArgs(chatId).returns(event);
        event.getState.returns(EventState.Launched);
        event.getOwner.returns(firstUserId);
        first.getId.returns(firstUserId);

        canManageEventStub.withArgs(first, event, context.service).resolves(true);
        await command.process({
            from: first,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: '',
            args: []
        });

        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.EventAlreadyLaunched);
    });

    it('should check that command called by event owner or admin', async () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/launch');
        
        events.getEvent.withArgs(chatId).returns(event);
        event.getOwner.returns(secondUserId);
        first.getId.returns(firstUserId);

        canManageEventStub.withArgs(first, event, context.service).resolves(false);
        await command.process({
            from: first,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: '',
            args: []
        });

        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.PermissionDenied);
    });

    it('should check number of participants', async () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/launch');
        
        events.getEvent.withArgs(chatId).returns(event);
        event.getState.returns(EventState.Registering);
        event.getOwner.returns(firstUserId);
        event.getParticipants.returns([]);
        first.getId.returns(firstUserId);

        canManageEventStub.withArgs(first, event, context.service).resolves(true);
        await command.process({
            from: first,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: '',
            args: []
        });

        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.NotEnoughUsers);
    });

    it('should check that all participants have chat id', async () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/launch');
        
        events.getEvent.withArgs(chatId).returns(event);
        users.getUser.withArgs(firstUserId).returns(first);
        users.getUser.withArgs(secondUserId).returns(second);
        users.getUser.withArgs(thirdUserId).returns(third);

        event.getId.returns(chatId);
        event.getState.returns(EventState.Registering);
        event.getOwner.returns(firstUserId);
        event.getParticipants.returns(participants);

        first.getId.returns(firstUserId);
        first.getChatId.returns(firstChatId);
        second.getId.returns(secondUserId);
        second.getChatId.returns(undefined); // problem is here
        third.getId.returns(thirdUserId);
        third.getChatId.returns(thirdChatId);

        canManageEventStub.withArgs(first, event, context.service).resolves(true);
        await command.process({
            from: first,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: '',
            args: []
        });

        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.NotAuthorizedUser);
    });
});