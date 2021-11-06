
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';

import { UsersManager } from '../../src/user/usersManager';
import { EventsManager } from '../../src/event/eventsManager';
import { OutputManager } from '../../src/output/outputManager';
import { User } from '../../src/user/user';
import { Context } from '../../src/context';
import { CommandUtils } from '../../src/commands/impl/commandUtils';
import { Event } from '../../src/event/event';

describe('CommandUtils', () => {
    const targetUserId = 12;
    const firstSantaId = 13;
    const secondSantaId = 14;
    const firstEventId = 42;
    const secondEventId = 43;

    const firstEventParticipants = [
        {
            user: firstSantaId,
            target: 0,
        },
        {
            user: secondSantaId,
            target: targetUserId
        }
    ];

    const secondEventParticipants = [
        {
            user: firstSantaId,
            target: targetUserId,
        },
        {
            user: secondSantaId,
            target: 0
        }
    ];

    const thirdEventParticipants = [
        {
            user: firstSantaId,
            target: 0,
        },
        {
            user: secondSantaId,
            target: 1
        }
    ];

    const target = sinon.stubInterface<User>();
    const firstSanta = sinon.stubInterface<User>();
    const secondSanta = sinon.stubInterface<User>();
    const firstEvent = sinon.stubInterface<Event>();
    const secondEvent = sinon.stubInterface<Event>();
    const users = sinon.stubInterface<UsersManager>();
    const events = sinon.stubInterface<EventsManager>();
    const output = sinon.stubInterface<OutputManager>();

    const context: Context = {
        users: users,
        events: events,
        output: output
    };
    
    beforeEach(() => {
        // base setup
        target.getId.returns(targetUserId);
        target.getActiveEvents.returns([firstEventId, secondEventId]);

        events.getEvent.withArgs(firstEventId).returns(firstEvent);
        events.getEvent.withArgs(secondEventId).returns(secondEvent);

        firstEvent.getParticipants.returns(firstEventParticipants);
        secondEvent.getParticipants.returns(secondEventParticipants);

        users.getUser.withArgs(firstSantaId).returns(firstSanta);
        users.getUser.withArgs(secondSantaId).returns(secondSanta);

        firstSanta.getChatId.returns(firstSantaId);
        secondSanta.getChatId.returns(secondSantaId);
    });

    afterEach(() => {
        sinon.default.reset();
    });

    it('should send wishlist to all', () => {
        CommandUtils.sendWishlistUpdate(target, context);

        expect(output.sendWishlistUpdate.calledTwice).to.be.true;
        expect(output.sendWishlistUpdate.firstCall.args[0]).to.be.equal(secondSantaId);
        expect(output.sendWishlistUpdate.firstCall.args[1]).to.be.equal(target);
        expect(output.sendWishlistUpdate.lastCall.args[0]).to.be.equal(firstSantaId);
        expect(output.sendWishlistUpdate.lastCall.args[1]).to.be.equal(target);
    });

    it('should send wishlist only to the second', () => {
        // here user is not a target
        firstEvent.getParticipants.returns(thirdEventParticipants);

        CommandUtils.sendWishlistUpdate(target, context);

        expect(output.sendWishlistUpdate.calledOnce).to.be.true;
        expect(output.sendWishlistUpdate.firstCall.args[0]).to.be.equal(firstSantaId);
        expect(output.sendWishlistUpdate.firstCall.args[1]).to.be.equal(target);
    });

    it('should check event', () => {
        target.getActiveEvents.returns([firstEventId]);
        events.getEvent.withArgs(firstEventId).returns(undefined);

        CommandUtils.sendWishlistUpdate(target, context);

        expect(output.sendWishlistUpdate.called).to.be.false;
    });

    it('should check santa chat id', () => {
        // cannot send data to second santa
        // this should never happen in real environment
        secondSanta.getChatId.returns(undefined);

        CommandUtils.sendWishlistUpdate(target, context);

        expect(output.sendWishlistUpdate.calledOnce).to.be.true;
        expect(output.sendWishlistUpdate.firstCall.args[0]).to.be.equal(firstSantaId);
        expect(output.sendWishlistUpdate.firstCall.args[1]).to.be.equal(target);
    });
});