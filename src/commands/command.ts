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
    /**
     * 
     * @param message Input message from user
     * 
     * @returns Object that will process next input from the user
     */
    process(message: Message): Command | undefined;
}