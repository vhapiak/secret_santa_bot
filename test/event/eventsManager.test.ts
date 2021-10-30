import { EventsManagerImpl } from '../../src/event/impl/eventsManagerImpl';
import { EventImpl } from '../../src/event/impl/eventImpl';
import { Event } from '../../src/event/event';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import fs from 'fs';
import path from 'path';

describe('EventsManager', () => {
    const root = '/tmp/';
    const id = 42;
    const name = 'chat';
    const owner = 13;
    const filepath = path.join(root, 'events', id + '.json');

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
    });

    it('should create directory during initialization', () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(false);
        const manager = new EventsManagerImpl(root);
        expect(fsStub.mkdirSync.called).to.be.true;
    });

    it('should not create new directory if exists', () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(true);
        const manager = new EventsManagerImpl(root);
        expect(fsStub.mkdirSync.called).to.be.false;
    });
    
    it('should create new event', () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(true);
        createEventStub.withArgs(filepath, id, name, owner).returns(event);

        const manager = new EventsManagerImpl(root);
        const created = manager.addEvent(id, name, owner);

        expect(created).to.be.equal(event);
    });

    it('should return existed event', () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(true);
        readFromFileStub.withArgs(filepath).returns(event);

        const manager = new EventsManagerImpl(root);
        const created = manager.getEvent(id);

        expect(created).to.be.equal(event);
    });

    it('should remove event from db', () => {
        const filepath = path.join(root, 'events', id + '.json');

        const manager = new EventsManagerImpl(root);
        manager.removeEvent(id);

        expect(fsStub.rmSync.called).to.be.true;
        expect(fsStub.rmSync.lastCall.args[0]).to.be.equal(filepath);
    });
});