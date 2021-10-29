import TelegramBot from "node-telegram-bot-api";
import { ButtonsFactory } from "./buttons/buttonsFactory";
import { CommandsFactory } from "./commands/commandsFactory";
import { User } from "./user/user";
import { UsersManager } from "./user/usersManager";

function commandDetector(msg: TelegramBot.Message): string | undefined {
    if (!msg.entities) {
        return undefined;
    }
    for (let entity of msg.entities) {
        if (entity.type == 'bot_command') {
            return msg.text?.substr(entity.offset, entity.length);
        }
    }
    return undefined;
}

function generateName(user: TelegramBot.User): string {
    return user.first_name + (user.last_name ? ' ' + user.last_name : '');
}

export class SecretSantaBot {
    constructor(
        private bot: TelegramBot,
        private users: UsersManager,
        private commandsFactory: CommandsFactory,
        private buttonsFactory: ButtonsFactory
    ) {

    }

    async processTextMessage(msg: TelegramBot.Message) {
        try {
            await this.processTextMessageImpl(msg);
        } catch (error) {
            this.bot.sendMessage(msg.chat.id, 'Internal error!');
        }
    }

    async processCallbackQuery(query: TelegramBot.CallbackQuery) {
        try {
            await this.processCallbackQueryImpl(query);
        } catch (error) {
            this.bot.answerCallbackQuery(
                query.id,
                {
                    text: 'Internal error!'
                }
            );
        }
    }

    private async processTextMessageImpl(msg: TelegramBot.Message): Promise<void> {
        if (!msg.from) {
            return;
        }

        const commandName = commandDetector(msg);
        const command = this.commandsFactory.createCommand(commandName);

        const user = await this.getUser(msg.from);

        if (msg.chat.type == 'private') {
            await user.bindChat(msg.chat.id);
        }

        await command.process({
            from: user,
            chat: {
                id: msg.chat.id,
                title: msg.chat.title ? msg.chat.title : '<unknow>'
            },
            data: msg.text ? msg.text : ''
        });
    }

    private async processCallbackQueryImpl(query: TelegramBot.CallbackQuery): Promise<void> {
        if (!query.data || !query.message) {
            console.warn('Empty query data');
            return;
        } 

        const button = this.buttonsFactory.createButton(query.data);
        if (!button) {
            console.warn('Unknown button');
            return;
        }
        
        const user = await this.getUser(query.from);

        await button.process({
            id: query.id,
            from: user,
            chatId: query.message.chat.id,
            messageId: query.message.message_id
        });
    }

    private async getUser(from: TelegramBot.User): Promise<User> {
        let user = await this.users.getUser(from.id);
        if (!user) {
            user = await this.users.addUser(from.id, generateName(from));
        }
        return user;
    }
}