import { EventImpl } from '../../src/event/impl/eventImpl';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import fs from 'fs';
import { EventState } from '../../src/event/event';
import { User } from '../../src/user/user';

describe('Event', () => {
    const any = sinon.default.match.any;
    const filepath = '/tmp/event.json';
    const id = 42;
    const name = 'chat';
    const ownerId = 6;
    const target = 7;
    const budget = '100$';
    const dataWithoutParticipants = JSON.stringify({
        id: id,
        owner: ownerId,
        name: name,
        state: EventState.Registering,
        participants: []
    });
    const launchedData = JSON.stringify({
        id: id,
        owner: ownerId,
        name: name,
        state: EventState.Launched,
        participants: []
    });
    const dataWithBudget = JSON.stringify({
        id: id,
        owner: ownerId,
        name: name,
        state: EventState.Registering,
        participants: [],
        budget: budget
    });
    const dataWithParticipants = JSON.stringify({
        id: id,
        owner: ownerId,
        name: name,
        state: EventState.Launched,
        participants: [{
            user: ownerId,
            target: target
        }]
    });

    const user = sinon.stubInterface<User>();
    const fsStub = sinon.stubObject(fs);

    before(() => {
        sinon.default.replace(fs, 'existsSync', fsStub.existsSync);
        sinon.default.replace(fs, 'readFileSync', fsStub.readFileSync);
        sinon.default.replace(fs, 'writeFileSync', fsStub.writeFileSync);
    });

    after(() => {
        sinon.default.restore();
    });

    afterEach(() => {
        fsStub.existsSync.reset();
        fsStub.writeFileSync.reset();
        fsStub.readFileSync.reset();
    });

    it('should save data to file during creation', () => {
        const event = EventImpl.createEvent(filepath, id, name, ownerId);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(dataWithoutParticipants);

        expect(event.getId()).to.be.equal(id);
        expect(event.getName()).to.be.equal(name);
        expect(event.getOwner()).to.be.equal(ownerId);
        expect(event.getState()).to.be.equal(EventState.Registering);
        expect(event.getParticipants().length).to.be.equal(0);
    });

    it('should save participants changes to file', () => {
        const event = new EventImpl(filepath, {
            id: id,
            owner: ownerId,
            name: name,
            state: EventState.Registering,
            participants: []
        });

        user.getId.returns(ownerId);
        event.toggleParticipant(user);
        expect(event.getParticipants().length).to.be.equal(1);
        expect(event.getParticipants()[0].user).to.be.equal(ownerId);
        expect(event.getParticipants()[0].target).to.be.undefined;

        expect(user.addActiveEvent.called);
        expect(user.addActiveEvent.lastCall.args[0]).to.be.equal(id);

        const another = 12;
        user.getId.returns(another);
        event.toggleParticipant(user);
        expect(event.getParticipants().length).to.be.equal(2);
        expect(event.getParticipants()[0].user).to.be.equal(ownerId);
        expect(event.getParticipants()[1].user).to.be.equal(another);

        user.getId.returns(ownerId);
        event.toggleParticipant(user);
        expect(event.getParticipants().length).to.be.equal(1);
        expect(event.getParticipants()[0].user).to.be.equal(another);

        expect(user.removeActiveEvent.called);
        expect(user.removeActiveEvent.lastCall.args[0]).to.be.equal(id);
    });

    it('should save state changes to file', () => {
        const event = new EventImpl(filepath, {
            id: id,
            owner: ownerId,
            name: name,
            state: EventState.Registering,
            participants: []
        });
        event.setState(EventState.Launched);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(launchedData);
        expect(event.getState()).to.be.equal(EventState.Launched);
    });

    it('should save target changes to file', () => {
        const event = new EventImpl(filepath, {
            id: id,
            owner: ownerId,
            name: name,
            state: EventState.Launched,
            participants: [{
                user: ownerId
            }]
        });
        event.setTarget(ownerId, target);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(dataWithParticipants);
        expect(event.getParticipants()[0].target).to.be.equal(target);
    });

    it('should save budget changes to file', () => {
        const event = new EventImpl(filepath, {
            id: id,
            owner: ownerId,
            name: name,
            state: EventState.Registering,
            participants: []
        });
        event.setBudget(budget);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(dataWithBudget);
        expect(event.getBudget()).to.be.equal(budget);
    });

    it('should throw in case of wrong target assignment', () => {
        const event = new EventImpl(filepath, {
            id: id,
            owner: ownerId,
            name: name,
            state: EventState.Launched,
            participants: []
        });
        expect(() => event.setTarget(ownerId, target)).to.throw;
    });

    it('should read data from file', () => {
        fsStub.existsSync.withArgs(filepath).returns(true);
        fsStub.readFileSync.withArgs(filepath, any).returns(dataWithParticipants);

        const event = EventImpl.readFromFile(filepath);

        expect(event?.getId()).to.be.equal(id);
        expect(event?.getName()).to.be.equal(name);
        expect(event?.getOwner()).to.be.equal(ownerId);
        expect(event?.getState()).to.be.equal(EventState.Launched);
        expect(event?.getParticipants().length).to.be.equal(1);
        expect(event?.getParticipants()[0].user).to.be.equal(ownerId);
    });

    it('should not return event if file not exists', () => {
        fsStub.existsSync.withArgs(filepath).returns(false);
        const event = EventImpl.readFromFile(filepath);
        expect(event).to.be.undefined;
    });
});