import { ChatId, User } from '../user/user';

export type Chat = {
    id: ChatId;
    title: string;
    private: boolean;
}

export type Message = {
    from: User;
    chat: Chat;
    data: string; // raw message data
    args: string[]; // command arguments 
}

export interface Command {
    /**
     * 
     * @param message Input message from user
     * 
     * @returns Object that will process next input from the user
     */
    process(message: Message): Promise<Command | undefined>;
}