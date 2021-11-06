/**
 * It is hard to automate this software unit testing,
 * so here we just check execution flow for line coverage.
 * 
 * See visualTest.ts 
 */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import TelegramBot from 'node-telegram-bot-api';
import { UsersManager } from '../../src/user/usersManager';
import { User } from '../../src/user/user';
import { Event, EventState } from '../../src/event/event';
import { OutputManagerImpl } from '../../src/output/impl/outputManagerImpl';
import { ErrorMessage, InfoMessage, ResponseMessage } from '../../src/output/outputManager';

// @todo check message content
describe('OutputManager', () => {
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

    beforeEach(() => {
        event.getName.returns(name);
        event.getOwner.returns(ownerId);

        owner.getId.returns(ownerId);
        owner.getName.returns(ownerName);

        other.getId.returns(otherId);
        owner.getName.returns(otherName);

        users.getUser.withArgs(ownerId).returns(owner);
        users.getUser.withArgs(otherId).returns(other);
    });
    
    afterEach(() => {
        sinon.default.reset();
    });

    it('should send error message', () => {
        const manager = new OutputManagerImpl('', bot, users);
        const errors = [
            ErrorMessage.AlreadyHasEvent,
            ErrorMessage.EventAlreadyLaunched,
            ErrorMessage.EventIsNotLaunched,
            ErrorMessage.InternalError,
            ErrorMessage.NoEvent,
            ErrorMessage.NotAuthorizedUser,
            ErrorMessage.NotEnoughUsers,
            ErrorMessage.NotPrivateChat,
            ErrorMessage.PermissionDenied,
        ];
        errors.forEach(error => {
            manager.sendError(chatId, error);
            expect(bot.sendMessage.called).to.be.true;
            expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
            expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
        });
        expect(bot.sendMessage.getCalls().length).to.be.equal(errors.length);
    });

    it('should send info message', () => {
        const manager = new OutputManagerImpl('', bot, users);
        const infos = [
            InfoMessage.EventCanceled,
            InfoMessage.EventFinished,
            InfoMessage.EventLaunched,
            InfoMessage.Help,
            InfoMessage.WaitingForWishlist,
            InfoMessage.WishlistReset,
            InfoMessage.WishlistUpdated,
        ];
        infos.forEach(info => {
            manager.sendInfo(chatId, info);
            expect(bot.sendMessage.called).to.be.true;
            expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
            expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
        });
        expect(bot.sendMessage.getCalls().length).to.be.equal(infos.length);
    });

    it('should send event message with registration', () => {
        const manager = new OutputManagerImpl('', bot, users);

        event.getState.returns(EventState.Registering);
        event.getParticipants.returns([
            { user: ownerId }, 
            { user: otherId}
        ]);

        manager.sendEvent(chatId, event);
        expect(bot.sendMessage.calledOnce).to.be.true;
        expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
        expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
    });

    it('should send launched event message', () => {
        const manager = new OutputManagerImpl('', bot, users);

        event.getState.returns(EventState.Launched);
        event.getParticipants.returns([
            { user: ownerId }, 
            { user: otherId}
        ]);

        manager.sendEvent(chatId, event);
        expect(bot.sendMessage.calledOnce).to.be.true;
        expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
        expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
    });

    it('should send event message without participants', () => {
        const manager = new OutputManagerImpl('', bot, users);

        event.getState.returns(EventState.Launched);
        event.getParticipants.returns([]);

        manager.sendEvent(chatId, event);
        expect(bot.sendMessage.calledOnce).to.be.true;
        expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
        expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
    });

    it('should send target message', () => {
        const manager = new OutputManagerImpl('', bot, users);

        manager.sendTarget(chatId, event, owner);
        expect(bot.sendMessage.calledOnce).to.be.true;
        expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
        expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
    });

    it('should send target message with wishlist', () => {
        const manager = new OutputManagerImpl('', bot, users);

        owner.getWishlist.returns('wishlist');

        manager.sendTarget(chatId, event, owner);
        expect(owner.getWishlist.called).to.be.true;
        expect(bot.sendMessage.calledOnce).to.be.true;
        expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
        expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
    });

    it('should send event cancellation', () => {
        const manager = new OutputManagerImpl('', bot, users);

        manager.sendEventCancellation(chatId, event);
        expect(bot.sendMessage.calledOnce).to.be.true;
        expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
        expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
    });

    it('should send wishlist update', () => {
        const manager = new OutputManagerImpl('', bot, users);

        owner.getWishlist.returns('wishlist');

        manager.sendWishlistUpdate(chatId, owner);
        expect(owner.getWishlist.called).to.be.true;
        expect(bot.sendMessage.calledOnce).to.be.true;
        expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
        expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
    });

    it('should send wishlist reset', () => {
        const manager = new OutputManagerImpl('', bot, users);

        owner.getWishlist.returns(undefined);

        manager.sendWishlistUpdate(chatId, owner);
        expect(owner.getWishlist.called).to.be.true;
        expect(bot.sendMessage.calledOnce).to.be.true;
        expect(bot.sendMessage.lastCall.args[0]).to.be.equal(chatId);
        expect(bot.sendMessage.lastCall.args[1].length).to.be.not.equal(0);
    });

    it('should update event message', () => {
        const manager = new OutputManagerImpl('', bot, users);

        event.getState.returns(EventState.Registering);
        event.getParticipants.returns([]);

        const messageId = 0;
        manager.updateEvent(chatId, messageId, event);
        expect(bot.editMessageText.calledOnce).to.be.true;
    });

    it('should send event message with cancellation', () => {
        const manager = new OutputManagerImpl('', bot, users);

        const messageId = 0;
        manager.cancelEvent(chatId, messageId);
        expect(bot.editMessageText.calledOnce).to.be.true;
    });

    it('should response to query', () => {
        const manager = new OutputManagerImpl('', bot, users);

        const responses = [
            ResponseMessage.AlreadyLaunched,
            ResponseMessage.EventCanceled,
            ResponseMessage.EventJoined,
            ResponseMessage.EventLeft,
            ResponseMessage.InternalError,
        ];
        const id = 'query';
        responses.forEach(response => {
            manager.responseOnClick(id, response);
            expect(bot.answerCallbackQuery.called).to.be.true;
            expect(bot.answerCallbackQuery.lastCall.args[0]).to.be.equal(id);
        });
        expect(bot.answerCallbackQuery.getCalls().length).to.be.equal(responses.length);
    });
});