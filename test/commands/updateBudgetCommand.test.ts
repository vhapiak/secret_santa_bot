
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { ErrorMessage, InfoMessage, OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { CommandsFactoryImpl } from '../../src/commands/impl/commandsFactoryImpl';
import { Context } from '../../src/context';
import { Event } from '../../src/event/event';

describe('UpdateBudgetCommand', () => {
    const chatId = 42;
    const userId = 13;
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

    it('should update budget', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/set_budget');
        const budget = '100$';
        
        events.getEvent.withArgs(chatId).returns(event);
        event.getId.returns(chatId);
        event.getOwner.returns(userId);
        user.getId.returns(userId);

        command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: budget
        });

        expect(event.setBudget.called).to.be.true;
        expect(event.setBudget.lastCall.args[0]).to.be.equal(budget);

        expect(output.sendEvent.called).to.be.true;
        expect(output.sendEvent.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendEvent.lastCall.args[1]).to.be.equal(event);

        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.BudgetUpdated);
    });

    it('should check that command called by event owner', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/set_budget');
        
        events.getEvent.withArgs(chatId).returns(event);
        event.getId.returns(chatId);
        event.getOwner.returns(1);
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

        expect(event.setBudget.called).to.be.false;

        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.PermissionDenied);
    });

    it('should check that command called by event owner', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/set_budget');
        
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

        expect(event.setBudget.called).to.be.false;

        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.NoEvent);
    });
});