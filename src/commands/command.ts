import { ChatId, User } from '../user/user';

export type Chat = {
    id: ChatId;
    title: string;
}

export type Message = {
    from: User;
    chat: Chat;
    data: string;
}

export interface Command {
    process(message: Message): Promise<Command | undefined>;
}