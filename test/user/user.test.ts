import { UserImpl } from '../../src/user/userImpl';

import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as sinon from 'ts-sinon';
import fs from 'fs';

use(chaiAsPromised);

describe('User', () => {
    const any = sinon.default.match.any;
    const filepath = '/tmp/user.json';
    const id = 42;
    const name = 'santa';
    const chatId = 6;
    const dataWithoutChat = JSON.stringify({
        id: id,
        name: name
    });
    const dataWithChat = JSON.stringify({
        id: id,
        name: name,
        chatId: chatId
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
        const user = await UserImpl.createUser(filepath, id, name);

        expect(fsPromisesStub.writeFile.lastCall.args[1]).to.be.equal(dataWithoutChat);

        expect(user.getId()).to.be.equal(id);
        expect(user.getName()).to.be.equal(name);
        expect(user.getChatId()).to.be.undefined;
    });

    it('should save chat info to file', async () => {
        const user = new UserImpl(filepath, {
            id: id,
            name: name
        });
        user.bindChat(chatId);

        expect(fsPromisesStub.writeFile.lastCall.args[1]).to.be.equal(dataWithChat);
        expect(user.getChatId()).to.be.equal(chatId);
    });

    it('should read data without chat info from file', async () => {
        fsStub.existsSync.withArgs(filepath).returns(true);
        fsPromisesStub.readFile.withArgs(filepath, any).returns(Promise.resolve(dataWithoutChat));

        const user = await UserImpl.readFromFile(filepath);

        expect(user?.getId()).to.be.equal(id);
        expect(user?.getName()).to.be.equal(name);
        expect(user?.getChatId()).to.be.undefined;
    });

    it('should read data with chat info from file', async () => {
        fsStub.existsSync.withArgs(filepath).returns(true);
        fsPromisesStub.readFile.withArgs(filepath, any).returns(Promise.resolve(dataWithChat));

        const user = await UserImpl.readFromFile(filepath);

        expect(user?.getId()).to.be.equal(id);
        expect(user?.getName()).to.be.equal(name);
        expect(user?.getChatId()).to.be.equal(chatId);
    });

    it('should not return user if file not exists', async () => {
        fsStub.existsSync.withArgs(filepath).returns(false);
        const user = await UserImpl.readFromFile(filepath);
        expect(user).to.be.undefined;
    });

    it('should throw in case of file reading error', async () => {
        fsStub.existsSync.withArgs(filepath).returns(true);
        fsPromisesStub.readFile.withArgs(filepath, any).returns(Promise.reject());
        expect(UserImpl.readFromFile(filepath)).to.be.eventually.rejected;
    });
});