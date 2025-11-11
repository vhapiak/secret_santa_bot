import { ChatId, User, UserId } from '../user/user';

export interface Service {
    getBotName(): string;
    isAdmin(user: UserId, chat: ChatId): Promise<boolean>;
}