import { EventImpl } from '../../src/event/eventImpl';

import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as sinon from 'ts-sinon';
import fs from 'fs';
import { EventState } from '../../src/event/event';

use(chaiAsPromised);

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

    const fsPromisesStub = sinon.stubObject(fs.promises);
    const fsStub = sinon.stubObject(fs);

    before(() => {
        sinon.default.replace(fs, 'existsSync', fsStub.existsSync);
        sinon.default.replace(fs.promises, 'readFile', fsPromisesStub.readFile);
        sinon.default.replace(fs.promises, 'writeFile', fsPromisesStub.writeFile);
    });

    after(() => {
        sinon.default.restore();
    });

    afterEach(() => {
        fsStub.existsSync.reset();
        fsPromisesStub.readFile.reset();
        fsStub.writeFile.reset();
    });

    it('should save data to file during creation', async () => {
        const event = await EventImpl.createEvent(filepath, id, name, owner);

        expect(fsPromisesStub.writeFile.lastCall.args[1]).to.be.equal(dataWithoutParticipants);

        expect(event.getId()).to.be.equal(id);
        expect(event.getName()).to.be.equal(name);
        expect(event.getOwner()).to.be.equal(owner);
        expect(event.getState()).to.be.equal(EventState.Registering);
        expect(event.getParticipants().length).to.be.equal(0);
    });

    it('should save participants changes to file', async () => {
        const user = new EventImpl(filepath, {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Registering,
            participants: []
        });

        await user.toogleParticipant(owner);
        expect(user.getParticipants().length).to.be.equal(1);
        expect(user.getParticipants()[0].user).to.be.equal(owner);
        expect(user.getParticipants()[0].target).to.be.undefined;

        const another = 12;
        await user.toogleParticipant(another);
        expect(user.getParticipants().length).to.be.equal(2);
        expect(user.getParticipants()[0].user).to.be.equal(owner);
        expect(user.getParticipants()[1].user).to.be.equal(another);

        await user.toogleParticipant(owner);
        expect(user.getParticipants().length).to.be.equal(1);
        expect(user.getParticipants()[0].user).to.be.equal(another);
    });

    it('should save state changes to file', async () => {
        const user = new EventImpl(filepath, {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Registering,
            participants: []
        });
        await user.setState(EventState.Launched);

        expect(fsPromisesStub.writeFile.lastCall.args[1]).to.be.equal(launchedData);
        expect(user.getState()).to.be.equal(EventState.Launched);
    });

    it('should save target changes to file', async () => {
        const user = new EventImpl(filepath, {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Launched,
            participants: [{
                user: owner
            }]
        });
        await user.setTarget(owner, target);

        expect(fsPromisesStub.writeFile.lastCall.args[1]).to.be.equal(dataWithParticipants);
        expect(user.getParticipants()[0].target).to.be.equal(target);
    });

    it('should throw in case of wrong target assignment', async () => {
        const user = new EventImpl(filepath, {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Launched,
            participants: []
        });
        expect(user.setTarget(owner, target)).to.be.eventually.rejected;
    });

    it('should read data from file', async () => {
        fsStub.existsSync.withArgs(filepath).returns(true);
        fsPromisesStub.readFile.withArgs(filepath, any).returns(Promise.resolve(dataWithParticipants));

        const event = await EventImpl.readFromFile(filepath);

        expect(event?.getId()).to.be.equal(id);
        expect(event?.getName()).to.be.equal(name);
        expect(event?.getOwner()).to.be.equal(owner);
        expect(event?.getState()).to.be.equal(EventState.Launched);
        expect(event?.getParticipants().length).to.be.equal(1);
        expect(event?.getParticipants()[0].user).to.be.equal(owner);
    });

    it('should not return user if file not exists', async () => {
        fsStub.existsSync.withArgs(filepath).returns(false);
        const event = await EventImpl.readFromFile(filepath);
        expect(event).to.be.undefined;
    });
});