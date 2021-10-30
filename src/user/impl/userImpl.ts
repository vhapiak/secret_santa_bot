import { ChatId, User, UserId } from '../user';

import fs from 'fs';

export type UserData = {
    id: UserId;
    name: string;
    chatId?: ChatId;
    wishlist?: string;
}

export class UserImpl implements User {
    constructor(private filepath: string, private data: UserData) {
    }

    getId(): UserId {
        return this.data.id;
    }
    getName(): string {
        return this.data.name;
    }

    getChatId(): ChatId | undefined {
        return this.data.chatId;
    }

    getWishlist(): string | undefined {
        return this.data.wishlist;
    }

    bindChat(chatId: ChatId): void {
        this.data.chatId = chatId;
        this.save();
    }

    setWitshlist(wishlist: string | undefined): void {
        this.data.wishlist = wishlist;
        this.save();
    }

    save(): void {
        fs.writeFileSync(
            this.filepath, 
            JSON.stringify(this.data),
            {
                encoding: 'utf8',
                flag: 'w+'
            }
        );
    }

    static createUser(filepath: string, id: UserId, name: string): User {
        const data: UserData = {
            id: id,
            name: name
        }
        const user = new UserImpl(filepath, data);
        user.save();
        return user;
    }

    static readFromFile(filepath: string): User | undefined {
        if (!fs.existsSync(filepath)) {
            return undefined;
        }

        const json =fs.readFileSync(filepath, {encoding: 'utf8'});
        // @todo check read fields
        const data = JSON.parse(json) as UserData;
        return new UserImpl(filepath, data);
    }
}