import { EventImpl } from '../../src/event/impl/eventImpl';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import fs from 'fs';
import { EventState } from '../../src/event/event';

describe('Event', () => {
    const any = sinon.default.match.any;
    const filepath = '/tmp/event.json';
    const id = 42;
    const name = 'chat';
    const owner = 6;
    const target = 7;
    const dataWithoutParticipants = JSON.stringify({
        id: id,
        owner: owner,
        name: name,
        state: EventState.Registering,
        participants: []
    });
    const launchedData = JSON.stringify({
        id: id,
        owner: owner,
        name: name,
        state: EventState.Launched,
        participants: []
    });
    const dataWithParticipants = JSON.stringify({
        id: id,
        owner: owner,
        name: name,
        state: EventState.Launched,
        participants: [{
            user: owner,
            target: target
        }]
    });

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
        const event = EventImpl.createEvent(filepath, id, name, owner);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(dataWithoutParticipants);

        expect(event.getId()).to.be.equal(id);
        expect(event.getName()).to.be.equal(name);
        expect(event.getOwner()).to.be.equal(owner);
        expect(event.getState()).to.be.equal(EventState.Registering);
        expect(event.getParticipants().length).to.be.equal(0);
    });

    it('should save participants changes to file', () => {
        const user = new EventImpl(filepath, {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Registering,
            participants: []
        });

        user.toogleParticipant(owner);
        expect(user.getParticipants().length).to.be.equal(1);
        expect(user.getParticipants()[0].user).to.be.equal(owner);
        expect(user.getParticipants()[0].target).to.be.undefined;

        const another = 12;
        user.toogleParticipant(another);
        expect(user.getParticipants().length).to.be.equal(2);
        expect(user.getParticipants()[0].user).to.be.equal(owner);
        expect(user.getParticipants()[1].user).to.be.equal(another);

        user.toogleParticipant(owner);
        expect(user.getParticipants().length).to.be.equal(1);
        expect(user.getParticipants()[0].user).to.be.equal(another);
    });

    it('should save state changes to file', () => {
        const user = new EventImpl(filepath, {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Registering,
            participants: []
        });
        user.setState(EventState.Launched);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(launchedData);
        expect(user.getState()).to.be.equal(EventState.Launched);
    });

    it('should save target changes to file', () => {
        const user = new EventImpl(filepath, {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Launched,
            participants: [{
                user: owner
            }]
        });
        user.setTarget(owner, target);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(dataWithParticipants);
        expect(user.getParticipants()[0].target).to.be.equal(target);
    });

    it('should throw in case of wrong target assignment', () => {
        const user = new EventImpl(filepath, {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Launched,
            participants: []
        });
        expect(() => user.setTarget(owner, target)).to.throw;
    });

    it('should read data from file', () => {
        fsStub.existsSync.withArgs(filepath).returns(true);
        fsStub.readFileSync.withArgs(filepath, any).returns(dataWithParticipants);

        const event = EventImpl.readFromFile(filepath);

        expect(event?.getId()).to.be.equal(id);
        expect(event?.getName()).to.be.equal(name);
        expect(event?.getOwner()).to.be.equal(owner);
        expect(event?.getState()).to.be.equal(EventState.Launched);
        expect(event?.getParticipants().length).to.be.equal(1);
        expect(event?.getParticipants()[0].user).to.be.equal(owner);
    });

    it('should not return user if file not exists', () => {
        fsStub.existsSync.withArgs(filepath).returns(false);
        const event = EventImpl.readFromFile(filepath);
        expect(event).to.be.undefined;
    });
});