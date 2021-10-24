
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import TelegramBot from 'node-telegram-bot-api';
import { UsersManager } from '../../src/user/usersManager';
import { User } from '../../src/user/user';
import { Event, EventState } from '../../src/event/event';
import { OutputManagerImpl } from '../../src/output/outputManagerImpl';
import { ErrorMessage, InfoMessage, ResponseMessage } from '../../src/output/outputManager';

// @todo check message content
describe('OutputManager', () => {
    const any = sinon.default.match.any;
    const chatId = 42;
    const name = 'Some group';
    const ownerId = 13;
    const ownerName = 'Owner User';
    const otherId= 14;
    const otherName = 'Other Name';

    const bot = sinon.stubInterface<TelegramBot>();
    const users = sinon.stubInterface<UsersManager>();
    const owner = sinon.stubInterface<User>();
    const other = sinon.stubInterface<User>();
    const event = sinon.stubInterface<Event>();

    afterEach(() => {
        sinon.default.reset();
    });

    it('should send error message', async () => {
        const manager = new OutputManagerImpl(bot, users);

        manager.sendError(chatId, ErrorMessage.AlreadyHasEvent);
        expect(bot.sendMessage.calledOnce).to.be.true;

        manager.sendError(chatId, ErrorMessage.InternalError);
        manager.sendError(chatId, ErrorMessage.NoEvent);
        manager.sendError(chatId, ErrorMessage.PermissionDenied);
        expect(bot.sendMessage.getCalls().length).to.be.equal(4);
    });

    it('should send info message', async () => {
        const manager = new OutputManagerImpl(bot, users);

        await manager.sendInfo(chatId, InfoMessage.Help);
        expect(bot.sendMessage.calledOnce).to.be.true;
    });

    it('should send event message', async () => {
        const manager = new OutputManagerImpl(bot, users);

        event.getName.returns(name);
        event.getState.returns(EventState.Registering);
        event.getOwner.returns(ownerId);
        event.getParticipants.returns([
            {
                user: ownerId
            }, {
                user: otherId
            }]);

        owner.getId.returns(ownerId);
        owner.getName.returns(ownerName);

        other.getId.returns(otherId);
        owner.getName.returns(otherName);

        users.getUser.withArgs(ownerId).returns(Promise.resolve(owner));
        users.getUser.withArgs(otherId).returns(Promise.resolve(other));

        await manager.sendEvent(chatId, event);
        expect(bot.sendMessage.calledOnce).to.be.true;
    });

    it('should send target message', async () => {
        const manager = new OutputManagerImpl(bot, users);

        event.getName.returns(name);
        owner.getId.returns(ownerId);
        owner.getName.returns(ownerName);

        await manager.sendTarget(chatId, event, owner);
        expect(bot.sendMessage.calledOnce).to.be.true;
    });

    it('should update event message', async () => {
        const manager = new OutputManagerImpl(bot, users);

        event.getName.returns(name);
        event.getState.returns(EventState.Registering);
        event.getOwner.returns(ownerId);
        event.getParticipants.returns([
            {
                user: ownerId
            }, {
                user: otherId
            }]);

        owner.getId.returns(ownerId);
        owner.getName.returns(ownerName);

        other.getId.returns(otherId);
        owner.getName.returns(otherName);

        users.getUser.withArgs(ownerId).returns(Promise.resolve(owner));
        users.getUser.withArgs(otherId).returns(Promise.resolve(other));

        const messageId = 0;
        await manager.updateEvent(chatId, messageId, event);
        expect(bot.editMessageText.calledOnce).to.be.true;
    });

    it('should response to query', async () => {
        const manager = new OutputManagerImpl(bot, users);

        await manager.responseOnClick('query', ResponseMessage.AlreadyLaunched);
        expect(bot.answerCallbackQuery.calledOnce).to.be.true;
    });
});