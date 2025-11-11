
import TelegramBot from 'node-telegram-bot-api';
import { UserId, ChatId } from '../../user/user';
import { Service } from '../service'

export class TelegramService implements Service {
    constructor(private botName: string, private bot: TelegramBot) {

    }

    getBotName(): string {
        return this.botName;
    }   

    async isAdmin(user: UserId, chat: ChatId): Promise<boolean> {
        const member = await this.bot.getChatMember(chat, user.toString());
        return member.status === 'administrator' || member.status === 'creator';
    }
}