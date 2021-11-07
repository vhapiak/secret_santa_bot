import { describe, it } from 'mocha';
import { expect } from 'chai';
import TelegramBot from 'node-telegram-bot-api';
import { CommandParser } from '../src/commandParser';

function makeBaseMessage(): TelegramBot.Message {
    return {
        message_id: 0,
        chat: {
            id: 0,
            type: 'private',
            title: ''
        },
        date: 0,
        from: {
            id: 0,
            first_name: '',
            last_name: '',
            is_bot: false
        }
    };
}

function makeMessage(command: string, text: string): TelegramBot.Message {
    const message = makeBaseMessage();
    message.text = text;
    message.entities = [
        {
            length: command.length,
            offset: text.indexOf(command),
            type: 'bot_command'
        }
    ];
    return message;
}

describe('CommandParser', () => {
    const botName = 'TestBot';

    it('should parse several arguments', () => {
        const command = '/command';
        const text = command + ' first second third';
        const result = CommandParser.parseCommand(botName, makeMessage(command, text));

        expect(result).to.be.deep.equal({
            name: command,
            fullName: command,
            args: ['first', 'second', 'third']
        });
    });

    it('should ignore trailing white spaces', () => {
        const command = '/command';
        const text = command + '  first   second \n   third';
        const result = CommandParser.parseCommand(botName, makeMessage(command, text));

        expect(result).to.be.deep.equal({
            name: command,
            fullName: command,
            args: ['first', 'second', 'third']
        });
    });

    it('should parse command without arguments', () => {
        const command = '/command';
        const text = command + '  ';
        const result = CommandParser.parseCommand(botName, makeMessage(command, text));

        expect(result).to.be.deep.equal({
            name: command,
            fullName: command,
            args: []
        });
    });

    it('should parse command with bot name', () => {
        const baseName = '/command';
        const command = baseName + '@' + botName;
        const text = command + 'arg';
        const result = CommandParser.parseCommand(botName, makeMessage(command, text));

        expect(result).to.be.deep.equal({
            name: baseName,
            fullName: command,
            args: ['arg']
        });
    });

    it('should ignore command for other bots', () => {
        const baseName = '/command';
        const command = baseName + '@AnotherBot';
        const text = command + 'arg';
        const result = CommandParser.parseCommand(botName, makeMessage(command, text));

        expect(result).to.be.deep.equal({
            args: []
        });
    });

    it('should ignore messages without text', () => {
        const message = makeBaseMessage();
        message.entities = [];
        const result = CommandParser.parseCommand(botName, message);

        expect(result).to.be.deep.equal({
            args: []
        });
    });

    it('should ignore messages without entities', () => {
        const result = CommandParser.parseCommand(botName, makeBaseMessage());

        expect(result).to.be.deep.equal({
            args: []
        });
    });
    
    it('should ignore non command entities', () => {   
        const message = makeBaseMessage();
        message.entities = [
            {
                offset: 0,
                length: 0,
                type: 'code'
            }
        ];
        message.text = ''
        const result = CommandParser.parseCommand(botName, message);

        expect(result).to.be.deep.equal({
            args: []
        });
    });
});