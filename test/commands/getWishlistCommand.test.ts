
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { ErrorMessage, InfoMessage, OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { CommandsFactoryImpl } from '../../src/commands/impl/commandsFactoryImpl';
import { Context } from '../../src/context';

describe('WishlistCommand', () => {
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

    it('should send current user wishlist', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/get_wishlist');
        
        command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: '',
            args: []
        });

        expect(output.sendWishlist.called).to.be.true;
        expect(output.sendWishlist.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendWishlist.lastCall.args[1]).to.be.equal(user);
    });

    it('should check that chat is private', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/get_wishlist');

        const nextCommand = command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: false
            },
            data: '',
            args: []
        });

        expect(output.sendWishlist.called).to.be.false;
        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.NotPrivateChat);
    });
});