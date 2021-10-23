import { User } from './user';
import { UserImpl } from './userImpl';
import { UsersManager } from './usersManager';

import * as fs from 'fs';
import * as path from 'path'

export class UsersManagerImpl implements UsersManager {
    constructor(root: string) {
        this.directory = path.join(root, 'users');
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory);
        }
    }

    async addUser(id: number, name: string): Promise<User> {
        return UserImpl.createUser(this.makeFilepath(id), id, name);
    }

    async getUser(id: number): Promise<User | undefined> {
        return UserImpl.readFromFile(this.makeFilepath(id));
    }

    private makeFilepath(id: number): string {
        return path.join(this.directory, id + '.json');
    }

    private directory: string;
}