import { EventsManagerImpl } from '../../src/event/impl/eventsManagerImpl';
import { EventImpl } from '../../src/event/impl/eventImpl';
import { Event } from '../../src/event/event';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import fs from 'fs';
import path from 'path';
import { UsersManager } from '../../src/user/usersManager';
import { User } from '../../src/user/user';

describe('EventsManager', () => {
    const root = '/tmp/';
    const id = 42;
    const name = 'chat';
    const firstUserId = 13;
    const secondUserId = 14;
    const filepath = path.join(root, 'events', id + '.json');

    const users = sinon.stubInterface<UsersManager>();
    const firstUser = sinon.stubInterface<User>();
    const secondUser = sinon.stubInterface<User>();
    const fsStub = sinon.stubObject(fs);
    const event = sinon.stubInterface<Event>();
    const createEventStub = sinon.default.stub<[string, number, string, number], Event>();
    const readFromFileStub = sinon.default.stub<[string], Event | undefined>();

    before(() => {
        sinon.default.replace(fs, 'existsSync', fsStub.existsSync);
        sinon.default.replace(fs, 'mkdirSync', fsStub.mkdirSync);
        sinon.default.replace(fs, 'rmSync', fsStub.rmSync);
        sinon.default.replace(EventImpl, 'createEvent', createEventStub);
        sinon.default.replace(EventImpl, 'readFromFile', readFromFileStub);
    });

    after(() => {
        sinon.default.restore();
    });

    afterEach(() => {
        fsStub.existsSync.reset();
        fsStub.mkdirSync.reset();
        fsStub.rmSync.reset();
        createEventStub.reset();
        readFromFileStub.reset();
        sinon.default.reset();
    });

    it('should create directory during initialization', () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(false);
        const manager = new EventsManagerImpl(root, users);
        expect(fsStub.mkdirSync.called).to.be.true;
    });

    it('should not create new directory if exists', () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(true);
        const manager = new EventsManagerImpl(root, users);
        expect(fsStub.mkdirSync.called).to.be.false;
    });
    
    it('should create new event', () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(true);
        createEventStub.withArgs(filepath, id, name, firstUserId).returns(event);

        const manager = new EventsManagerImpl(root, users);
        const created = manager.addEvent(id, name, firstUserId);

        expect(created).to.be.equal(event);
    });

    it('should return existed event', () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(true);
        readFromFileStub.withArgs(filepath).returns(event);

        const manager = new EventsManagerImpl(root, users);
        const created = manager.getEvent(id);

        expect(created).to.be.equal(event);
    });

    it('should remove event from db', () => {
        const filepath = path.join(root, 'events', id + '.json');

        readFromFileStub.withArgs(filepath).returns(event);
        event.getParticipants.returns([
            {
                user: firstUserId
            }, 
            {
                user: secondUserId
            }
        ]);
        users.getUser.withArgs(firstUserId).returns(firstUser);
        users.getUser.withArgs(secondUserId).returns(secondUser);

        const manager = new EventsManagerImpl(root, users);
        manager.removeEvent(id);

        expect(firstUser.removeActiveEvent.called);
        expect(firstUser.removeActiveEvent.lastCall.args[0]).to.be.equal(id);
        expect(secondUser.removeActiveEvent.called);
        expect(secondUser.removeActiveEvent.lastCall.args[0]).to.be.equal(id);

        expect(fsStub.rmSync.called).to.be.true;
        expect(fsStub.rmSync.lastCall.args[0]).to.be.equal(filepath);
    });
});