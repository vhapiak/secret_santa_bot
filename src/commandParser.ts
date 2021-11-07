import TelegramBot from "node-telegram-bot-api"

export type CommandInfo = {
    name?: string;
    fullName?: string;
    args: string[];
}

export class CommandParser {

    /**
     * Parse bot command and it arguments
     * 
     * @param botName Telegram bot name to skip other bot commands
     * @param msg Telegram message
     * 
     * @returns Undefine it there is no command in message
     */
    static parseCommand(botName: string, msg: TelegramBot.Message): CommandInfo {
        if (!msg.entities || !msg.text) {
            return { args: [] };
        }
        for (let entity of msg.entities) {
            if (entity.type == 'bot_command') {
                const fullCommand = msg.text.substr(entity.offset, entity.length);
                const index = fullCommand.indexOf('@');
                if (index === -1) {
                    return {
                        name: fullCommand,
                        fullName: fullCommand,
                        args: CommandParser.parseArguments(msg.text, entity)
                    };
                } else {
                    const mentionedBot = fullCommand.substr(index + 1, fullCommand.length);
                    if (mentionedBot === botName) {
                        return {
                            name: fullCommand.substr(0, index),
                            fullName: fullCommand,
                            args: CommandParser.parseArguments(msg.text, entity)
                        }
                    }
                }
            }
        }
        return { args: [] };
    }

    private static parseArguments(text: string, commandEntity: TelegramBot.MessageEntity): string[] {
        const trimmed = text.substring(commandEntity.offset + commandEntity.length, text.length).trim();
        if (trimmed.length === 0) {
            return [];
        }
        const splitted = trimmed.split(/\s+/g);
        return splitted.map(arg => arg.trim());
    }
}