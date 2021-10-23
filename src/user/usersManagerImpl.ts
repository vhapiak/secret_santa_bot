import { User, UserId } from './user';
import { UserImpl } from './userImpl';
import { UsersManager } from './usersManager';

import fs from 'fs';
import path from 'path'

export class UsersManagerImpl implements UsersManager {
    constructor(root: string) {
        this.directory = path.join(root, 'users');
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, {recursive: true});
        }
    }

    async addUser(id: UserId, name: string): Promise<User> {
        return UserImpl.createUser(this.makeFilepath(id), id, name);
    }

    async getUser(id: UserId): Promise<User | undefined> {
        return UserImpl.readFromFile(this.makeFilepath(id));
    }

    private makeFilepath(id: UserId): string {
        return path.join(this.directory, id + '.json');
    }

    private directory: string;
}