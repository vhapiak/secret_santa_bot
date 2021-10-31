import { UserImpl } from '../../src/user/impl/userImpl';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import fs from 'fs';

describe('User', () => {
    const any = sinon.default.match.any;
    const filepath = '/tmp/user.json';
    const id = 42;
    const name = 'santa';
    const chatId = 6;
    const wishlist = 'wishlist';
    const firstEventeventId = 7;
    const secondEventeventId = 8;
    const dataWithoutChat = JSON.stringify({
        id: id,
        name: name,
        events: []
    });
    const dataWithChat = JSON.stringify({
        id: id,
        name: name,
        events: [],
        chatId: chatId,
    });
    const dataWithWishlist  = JSON.stringify({
        id: id,
        name: name,
        events: [],
        wishlist: wishlist
    });
    const dataWithEvents  = JSON.stringify({
        id: id,
        name: name,
        events: [firstEventeventId, secondEventeventId]
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
        const user = UserImpl.createUser(filepath, id, name);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(dataWithoutChat);

        expect(user.getId()).to.be.equal(id);
        expect(user.getName()).to.be.equal(name);
        expect(user.getChatId()).to.be.undefined;
    });

    it('should save new active events id to file', () => {
        const user = new UserImpl(filepath, {
            id: id,
            name: name,
            events: []
        });
        user.addActiveEvent(firstEventeventId);
        user.addActiveEvent(secondEventeventId);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(dataWithEvents);
        expect(user.getActiveEvents().length).to.be.equal(2);
        expect(user.getActiveEvents()[0]).to.be.equal(firstEventeventId);
        expect(user.getActiveEvents()[1]).to.be.equal(secondEventeventId);
    });

    it('should remove active event', () => {
        const user = new UserImpl(filepath, {
            id: id,
            name: name,
            events: [firstEventeventId, secondEventeventId]
        });
        user.removeActiveEvent(secondEventeventId);

        expect(user.getActiveEvents().length).to.be.equal(1);
        expect(user.getActiveEvents()[0]).to.be.equal(firstEventeventId);
    });

    it('should save chat info to file', () => {
        const user = new UserImpl(filepath, {
            id: id,
            name: name,
            events: []
        });
        user.bindChat(chatId);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(dataWithChat);
        expect(user.getChatId()).to.be.equal(chatId);
    });

    it('should save wishlist info to file', () => {
        const user = new UserImpl(filepath, {
            id: id,
            name: name,
            events: []
        });
        user.setWitshlist(wishlist);

        expect(fsStub.writeFileSync.lastCall.args[1]).to.be.equal(dataWithWishlist);
        expect(user.getWishlist()).to.be.equal(wishlist);
    });

    it('should read data without chat info from file', () => {
        fsStub.existsSync.withArgs(filepath).returns(true);
        fsStub.readFileSync.withArgs(filepath, any).returns(dataWithoutChat);

        const user = UserImpl.readFromFile(filepath);

        expect(user?.getId()).to.be.equal(id);
        expect(user?.getName()).to.be.equal(name);
        expect(user?.getChatId()).to.be.undefined;
    });

    it('should read data with chat info from file', () => {
        fsStub.existsSync.withArgs(filepath).returns(true);
        fsStub.readFileSync.withArgs(filepath, any).returns(dataWithChat);

        const user = UserImpl.readFromFile(filepath);

        expect(user?.getId()).to.be.equal(id);
        expect(user?.getName()).to.be.equal(name);
        expect(user?.getChatId()).to.be.equal(chatId);
    });

    it('should not return user if file not exists', () => {
        fsStub.existsSync.withArgs(filepath).returns(false);
        const user = UserImpl.readFromFile(filepath);
        expect(user).to.be.undefined;
    });
});