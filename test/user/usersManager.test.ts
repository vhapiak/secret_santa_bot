import { UsersManagerImpl } from '../../src/user/usersManagerImpl';
import { UserImpl } from '../../src/user/userImpl';
import { User } from '../../src/user/user';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import fs from 'fs';
import path from 'path';
import exp from 'constants';

describe('UsersManager', () => {
    const any = sinon.default.match.any;
    const root = '/tmp/';
    const id = 42;
    const name = 'santa';
    const filepath = path.join(root, 'users', id + '.json');

    const fsStub = sinon.stubObject(fs);
    const user = sinon.stubInterface<User>();
    const createUserStub = sinon.default.stub<[string, number, string], Promise<User>>();
    const readFromFileStub = sinon.default.stub<[string], Promise<User | undefined>>();

    before(() => {
        sinon.default.replace(fs, 'existsSync', fsStub.existsSync);
        sinon.default.replace(fs, 'mkdirSync', fsStub.mkdirSync);
        sinon.default.replace(UserImpl, 'createUser', createUserStub);
        sinon.default.replace(UserImpl, 'readFromFile', readFromFileStub);
    });

    after(() => {
        sinon.default.restore();
    });

    afterEach(() => {
        fsStub.existsSync.reset();
        fsStub.mkdirSync.reset();
        createUserStub.reset();
        readFromFileStub.reset();
    });

    it('should create directory during initialization', () => {
        fsStub.existsSync.withArgs(path.join(root, 'users')).returns(false);
        const manager = new UsersManagerImpl(root);
        expect(fsStub.mkdirSync.called).to.be.true;
    });

    it('should not create new directory if exists', () => {
        fsStub.existsSync.withArgs(path.join(root, 'users')).returns(true);
        const manager = new UsersManagerImpl(root);
        expect(fsStub.mkdirSync.called).to.be.false;
    });
    
    it('should create new user', async () => {
        fsStub.existsSync.withArgs(path.join(root, 'users')).returns(true);
        createUserStub.withArgs(filepath, id, name).returns(Promise.resolve(user));

        const manager = new UsersManagerImpl(root);
        const created = await manager.addUser(id, name);

        expect(created).to.be.equal(user);
    });

    it('should return existed user', async () => {
        fsStub.existsSync.withArgs(path.join(root, 'users')).returns(true);
        readFromFileStub.withArgs(filepath).returns(Promise.resolve(user));

        const manager = new UsersManagerImpl(root);
        const created = await manager.getUser(id);

        expect(created).to.be.equal(user);
    });
});