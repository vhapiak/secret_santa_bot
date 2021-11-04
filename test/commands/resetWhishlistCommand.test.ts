
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { ErrorMessage, InfoMessage, OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { CommandsFactoryImpl } from '../../src/commands/impl/commandsFactoryImpl';
import { Context } from '../../src/context';
import { CommandUtils } from '../../src/commands/impl/commandUtils';

describe('ResetWhishlistCommand', () => {
    const chatId = 42;
    const title = 'Some group';

    const user = sinon.stubInterface<User>();
    const users = sinon.stubInterface<UsersManager>();
    const events = sinon.stubInterface<EventsManager>();
    const output = sinon.stubInterface<OutputManager>();
    
    const sendWhishlistUpdateStub = sinon.default.stub<[User, Context], void>();

    const context: Context = {
        users: users,
        events: events,
        output: output
    };

    before(() => {
        sinon.default.replace(CommandUtils, 'sendWhishlistUpdate', sendWhishlistUpdateStub);
    });

    afterEach(() => {
        sinon.default.reset();
    });

    after(() => {
        sinon.default.restore();
    });

    it('should reset wishlist', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/resetWhishlist');
        
        command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: ''
        });

        expect(user.setWitshlist.called).to.be.true;
        expect(user.setWitshlist.lastCall.args[0]).to.be.undefined;

        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.WishlistReset);

        expect(sendWhishlistUpdateStub.called).to.be.true;
        expect(sendWhishlistUpdateStub.lastCall.args[0]).to.be.equal(user);
    });

    it('should check that chat is private', () => {
        const factory = new CommandsFactoryImpl(context);
        const command = factory.createCommand('/resetWhishlist');

        command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: false
            },
            data: ''
        });

        expect(output.sendError.called).to.be.true;
        expect(output.sendError.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendError.lastCall.args[1]).to.be.equal(ErrorMessage.NotPrivateChat);

        expect(sendWhishlistUpdateStub.called).to.be.false;
    });
});