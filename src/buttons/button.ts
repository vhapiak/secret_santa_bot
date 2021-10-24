import { ChatId, User } from '../user/user';

export type Request = {
    id: string; // Telegram use string for request id
    from: User,
    chatId: ChatId;
    messageId: number;
}

export interface Button {
    process(request: Request): Promise<void>;
}