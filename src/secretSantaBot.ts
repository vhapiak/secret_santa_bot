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

    processTextMessage(msg: TelegramBot.Message): void {
        try {
            this.processTextMessageImpl(msg);
        } catch (error) {
            this.bot.sendMessage(msg.chat.id, 'Internal error!');
        }
    }

    processCallbackQuery(query: TelegramBot.CallbackQuery): void {
        try {
            this.processCallbackQueryImpl(query);
        } catch (error) {
            this.bot.answerCallbackQuery(
                query.id,
                {
                    text: 'Internal error!'
                }
            );
        }
    }

    private processTextMessageImpl(msg: TelegramBot.Message): void {
        if (!msg.from) {
            return;
        }

        const commandName = commandDetector(msg);
        const command = this.commandsFactory.createCommand(commandName);

        const user = this.getUser(msg.from);

        if (msg.chat.type == 'private') {
            user.bindChat(msg.chat.id);
        }

        command.process({
            from: user,
            chat: {
                id: msg.chat.id,
                title: msg.chat.title ? msg.chat.title : '<unknow>'
            },
            data: msg.text ? msg.text : ''
        });
    }

    private processCallbackQueryImpl(query: TelegramBot.CallbackQuery): void {
        if (!query.data || !query.message) {
            console.warn('Empty query data');
            return;
        } 

        const button = this.buttonsFactory.createButton(query.data);
        if (!button) {
            console.warn('Unknown button');
            return;
        }
        
        const user = this.getUser(query.from);

        button.process({
            id: query.id,
            from: user,
            chatId: query.message.chat.id,
            messageId: query.message.message_id
        });
    }

    private getUser(from: TelegramBot.User): User {
        let user = this.users.getUser(from.id);
        if (!user) {
            user = this.users.addUser(from.id, generateName(from));
        }
        return user;
    }
}