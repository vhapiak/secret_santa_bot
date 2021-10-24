import { EventsManagerImpl } from '../../src/event/eventsManagerImpl';
import { EventImpl } from '../../src/event/eventImpl';
import { Event } from '../../src/event/event';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import fs from 'fs';
import path from 'path';

describe('EventsManager', () => {
    const any = sinon.default.match.any;
    const root = '/tmp/';
    const id = 42;
    const name = 'chat';
    const owner = 13;
    const filepath = path.join(root, 'events', id + '.json');

    const fsStub = sinon.stubObject(fs);
    const fsPromisesStub = sinon.stubObject(fs.promises);
    const event = sinon.stubInterface<Event>();
    const createEventStub = sinon.default.stub<[string, number, string, number], Promise<Event>>();
    const readFromFileStub = sinon.default.stub<[string], Promise<Event | undefined>>();

    before(() => {
        sinon.default.replace(fs, 'existsSync', fsStub.existsSync);
        sinon.default.replace(fs, 'mkdirSync', fsStub.mkdirSync);
        sinon.default.replace(fs.promises, 'rm', fsPromisesStub.rm);
        sinon.default.replace(EventImpl, 'createEvent', createEventStub);
        sinon.default.replace(EventImpl, 'readFromFile', readFromFileStub);
    });

    after(() => {
        sinon.default.restore();
    });

    afterEach(() => {
        fsStub.existsSync.reset();
        fsStub.mkdirSync.reset();
        fsPromisesStub.rm.reset();
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
    
    it('should create new event', async () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(true);
        createEventStub.withArgs(filepath, id, name, owner).returns(Promise.resolve(event));

        const manager = new EventsManagerImpl(root);
        const created = await manager.addEvent(id, name, owner);

        expect(created).to.be.equal(event);
    });

    it('should return existed event', async () => {
        fsStub.existsSync.withArgs(path.join(root, 'events')).returns(true);
        readFromFileStub.withArgs(filepath).returns(Promise.resolve(event));

        const manager = new EventsManagerImpl(root);
        const created = await manager.getEvent(id);

        expect(created).to.be.equal(event);
    });

    it('should remove event from db', async () => {
        const filepath = path.join(root, 'events', id + '.json');

        const manager = new EventsManagerImpl(root);
        await manager.removeEvent(id);

        expect(fsPromisesStub.rm.called).to.be.true;
        expect(fsPromisesStub.rm.lastCall.args[0]).to.be.equal(filepath);
    });
});