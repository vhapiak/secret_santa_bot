import TelegramBot from "node-telegram-bot-api";
import { ButtonsFactory } from "./buttons/buttonsFactory";
import { CommandInfo, CommandParser } from "./commandParser";
import { Command } from "./commands/command";
import { CommandsFactory } from "./commands/commandsFactory";
import { ChatId, User } from "./user/user";
import { ErrorMessage, ResponseMessage } from "./output/outputManager";
import { Context } from "./context";

function generateName(user: TelegramBot.User): string {
    return user.first_name + (user.last_name ? ' ' + user.last_name : '');
}

/**
 * Bot implementation that translate user request to 
 * commands and buttons processing.
 */
export class SecretSantaBot {
    constructor(
        private context: Context,
        private commandsFactory: CommandsFactory,
        private buttonsFactory: ButtonsFactory
    ) {

    }

    async processTextMessage(msg: TelegramBot.Message) {
        try {
            await this.processTextMessageImpl(msg);
        } catch (error) {
            this.context.output.sendError(msg.chat.id, ErrorMessage.InternalError);
        }
    }

    processCallbackQuery(query: TelegramBot.CallbackQuery): void {
        try {
            this.processCallbackQueryImpl(query);
        } catch (error) {
            this.context.output.responseOnClick(query.id, ResponseMessage.InternalError);
        }
    }

    private async processTextMessageImpl(msg: TelegramBot.Message) {
        if (!msg.from) {
            return;
        }

        const commandInfo = CommandParser.parseCommand(this.context.service.getBotName(), msg);
        const command = this.getActiveCommand(msg.chat.id, commandInfo);

        const user = this.getUser(msg.from);
        if (msg.chat.type == 'private') {
            user.bindChat(msg.chat.id);
        }

        const nextCommand = await command.process({
            from: user,
            chat: {
                id: msg.chat.id,
                title: msg.chat.title ? msg.chat.title : '<unknown>',
                private: msg.chat.type === 'private'
            },
            data: msg.text ? msg.text : '',
            args: commandInfo.args
        });

        if (nextCommand) {
            this.activeDialogs.set(msg.chat.id, nextCommand);
        } else {
            this.activeDialogs.delete(msg.chat.id);
        }
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

        button.onClick({
            id: query.id,
            from: user,
            chatId: query.message.chat.id,
            messageId: query.message.message_id
        });
    }

    private getUser(from: TelegramBot.User): User {
        let user = this.context.users.getUser(from.id);
        if (!user) {
            user = this.context.users.addUser(from.id, generateName(from));
        }
        return user;
    }

    private getActiveCommand(chatId: ChatId, commandInfo: CommandInfo): Command {
        let command = this.activeDialogs.get(chatId);
        if (command) {
            return command;
        }
        return this.commandsFactory.createCommand(commandInfo.name);
    }

    private activeDialogs = new Map<ChatId, Command>();
}