
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { InfoMessage, OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { Context } from '../../src/context';
import { CommandUtils } from '../../src/commands/impl/commandUtils';
import { UpdateWhishlistDialog } from '../../src/commands/impl/updateWishlistDialog';

describe('WhishlistCommand', () => {
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

    it('should save whishlist', () => {
        const command = new UpdateWhishlistDialog(context);
        
        const nextCommand = command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: 'whishlist'
        });

        expect(user.setWitshlist.called).to.be.true;
        expect(user.setWitshlist.lastCall.args[0]).to.be.equal('whishlist');

        expect(nextCommand).to.be.undefined;
        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.WishlistUpdated);
        
        expect(sendWhishlistUpdateStub.called);
        expect(sendWhishlistUpdateStub.lastCall.args[0]).to.be.equal(user);
    });

    it('should check empty message data', () => {
        const command = new UpdateWhishlistDialog(context);
        
        const nextCommand = command.process({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: ''
        });

        expect(user.setWitshlist.called).to.be.true;
        expect(user.setWitshlist.lastCall.args[0]).to.be.equal(undefined);
        
        expect(nextCommand).to.be.undefined;
        expect(output.sendInfo.called).to.be.true;
        expect(output.sendInfo.lastCall.args[0]).to.be.equal(chatId);
        expect(output.sendInfo.lastCall.args[1]).to.be.equal(InfoMessage.WishlistUpdated);

        expect(sendWhishlistUpdateStub.called);
        expect(sendWhishlistUpdateStub.lastCall.args[0]).to.be.equal(user);
    });
});