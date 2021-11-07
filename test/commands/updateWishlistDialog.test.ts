
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { InfoMessage, OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { Context } from '../../src/context';
import { CommandUtils } from '../../src/commands/impl/commandUtils';
import { UpdateWishlistDialog } from '../../src/commands/impl/updateWishlistDialog';

describe('WishlistCommand', () => {
    const chatId = 42;
    const title = 'Some group';

    const user = sinon.stubInterface<User>();
    const users = sinon.stubInterface<UsersManager>();
    const events = sinon.stubInterface<EventsManager>();
    const output = sinon.stubInterface<OutputManager>();
    
    const sendWishlistUpdateStub = sinon.default.stub<[User, Context], void>();

    const context: Context = {
        users: users,
        events: events,
        output: output
    };

    before(() => {
        sinon.default.replace(CommandUtils, 'sendWishlistUpdate', sendWishlistUpdateStub);
    });

    afterEach(() => {
        sinon.default.reset();
    });

    after(() => {
        sinon.default.restore();
    });

    it('should save wishlist', () => {
        const command = new UpdateWishlistDialog(context);
        
        const nextCommand = command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: 'wishlist',
            args: []
        });

        expect(user.setWishlist.called).to.be.true;
        expect(user.setWishlist.lastCall.args[0]).to.be.equal('wishlist');

        expect(nextCommand).to.be.undefined;
        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.WishlistUpdated);
        
        expect(sendWishlistUpdateStub.called);
        expect(sendWishlistUpdateStub.lastCall.args[0]).to.be.equal(user);
    });

    it('should check empty message data', () => {
        const command = new UpdateWishlistDialog(context);
        
        const nextCommand = command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: '',
            args: []
        });

        expect(user.setWishlist.called).to.be.true;
        expect(user.setWishlist.lastCall.args[0]).to.be.equal(undefined);
        
        expect(nextCommand).to.be.undefined;
        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.WishlistUpdated);

        expect(sendWishlistUpdateStub.called);
        expect(sendWishlistUpdateStub.lastCall.args[0]).to.be.equal(user);
    });
});