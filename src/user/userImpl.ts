import { User } from './user';

import fs from 'fs';

export type UserData = {
    id: number;
    name: string;
    chatId?: number;
}

export class UserImpl implements User {
    constructor(private filepath: string, private data: UserData) {
    }

    getId(): number {
        return this.data.id;
    }
    getName(): string {
        return this.data.name;
    }

    getChatId(): number | undefined {
        return this.data.chatId;
    }

    async bindChat(chatId: number): Promise<void> {
        this.data.chatId = chatId;
        return this.save();
    }

    async save(): Promise<void> {
        return fs.promises.writeFile(
            this.filepath, 
            JSON.stringify(this.data),
            {
                encoding: 'utf8',
                flag: 'w+'
            }
        );
    }

    static async createUser(filepath: string, id: number, name: string): Promise<User> {
        const data: UserData = {
            id: id,
            name: name
        }
        const user = new UserImpl(filepath, data);
        await user.save();
        return user;
    }

    static async readFromFile(filepath: string): Promise<User | undefined> {
        if (!fs.existsSync(filepath)) {
            return undefined;
        }

        const json = await fs.promises.readFile(filepath, {encoding: 'utf8'});
        // @todo check read fields
        const data = JSON.parse(json) as UserData;
        return new UserImpl(filepath, data);
    }
}