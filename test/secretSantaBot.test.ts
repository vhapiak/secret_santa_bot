
import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'ts-sinon';
import TelegramBot from 'node-telegram-bot-api';
import { UsersManager } from '../src/user/usersManager';
import { User } from '../src/user/user';
import { CommandsFactory } from '../src/commands/commandsFactory';
import { Command } from '../src/commands/command';
import { ButtonsFactory } from '../src/buttons/buttonsFactory';
import { Button } from '../src/buttons/button';
import { SecretSantaBot } from '../src/secretSantaBot';

describe('SecretSantaBot', () => {
    const botName = 'TestBot';
    const queryId = 'query';
    const messageId = 1;
    const chatId = 42;
    const title = 'santa';
    const userId = 13;
    const firstName = 'Test';
    const lastName = 'User';

    const telegram = sinon.stubInterface<TelegramBot>();
    const users = sinon.stubInterface<UsersManager>();
    const user = sinon.stubInterface<User>();
    const commands = sinon.stubInterface<CommandsFactory>();
    const command = sinon.stubInterface<Command>();
    const buttons = sinon.stubInterface<ButtonsFactory>();
    const button = sinon.stubInterface<Button>();

    afterEach(() => {
        sinon.default.reset();
    });

    it('should process command', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        users.getUser.withArgs(userId).returns(user);
        commands.createCommand.withArgs('/launch').returns(command);
        
        bot.processTextMessage({
            message_id: messageId,
            chat: {
                id: chatId,
                type: 'group',
                title: title
            },
            date: 0,
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            },
            text: '/launch',
            entities: [
                {
                    offset: 0,
                    length: 7,
                    type: 'bot_command'
                }
            ]
        });

        expect(command.process.called).to.be.true;
        expect(command.process.lastCall.args[0]).to.be.deep.equal({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: false
            },
            data: '/launch',
            args: []
        });
    });

    it('should process default command', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        users.getUser.withArgs(userId).returns(user);
        commands.createCommand.withArgs(undefined).returns(command);
        
        bot.processTextMessage({
            message_id: messageId,
            chat: {
                id: chatId,
                type: 'private',
                title: title
            },
            date: 0,
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            }
        });

        expect(command.process.called).to.be.true;
        expect(command.process.lastCall.args[0]).to.be.deep.equal({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: '',
            args: []
        });
    });

    // in groups command may look like /command@BotName
    it('should process command assigned to bot', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        users.getUser.withArgs(userId).returns(user);
        commands.createCommand.withArgs('/launch').returns(command);
        
        bot.processTextMessage({
            message_id: messageId,
            chat: {
                id: chatId,
                type: 'group',
                title: title
            },
            date: 0,
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            },
            text: '/launch@TestBot',
            entities: [
                {
                    offset: 0,
                    length: 15,
                    type: 'bot_command'
                }
            ]
        });

        expect(command.process.called).to.be.true;
    });

    // in groups command may look like /command@NotOurBot
    it('should skip processing of another bot command', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        users.getUser.withArgs(userId).returns(user);
        commands.createCommand.withArgs(undefined).returns(command);
        
        bot.processTextMessage({
            message_id: messageId,
            chat: {
                id: chatId,
                type: 'group',
                title: title
            },
            date: 0,
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            },
            text: '/launch@AnotherBot',
            entities: [
                {
                    offset: 0,
                    length: 18,
                    type: 'bot_command'
                }
            ]
        });

        expect(command.process.called).to.be.true;
    });

    it('should register user and bind chat', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        users.getUser.withArgs(userId).returns(undefined);
        users.addUser.withArgs(userId, `${firstName} ${lastName}`).returns(user);
        commands.createCommand.returns(command);
        
        bot.processTextMessage({
            message_id: messageId,
            chat: {
                id: chatId,
                type: 'private',
                title: title
            },
            date: 0,
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            }
        });

        expect(user.bindChat.called).to.be.true;
        expect(user.bindChat.lastCall.args[0]).to.be.equal(chatId);
    });

    it('should skip process invalid message', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);
        
        bot.processTextMessage({
            message_id: messageId,
            chat: {
                id: chatId,
                type: 'private',
                title: title
            },
            date: 0
        });

        expect(users.getUser.called).to.be.false;
    });

    it('should notify about internal error during message processing', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);
        
        users.getUser.throws('some error');

        bot.processTextMessage({
            message_id: messageId,
            chat: {
                id: chatId,
                type: 'private',
                title: title
            },
            date: 0,
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            }
        });

        expect(telegram.sendMessage.called).to.be.true;
        expect(telegram.sendMessage.lastCall.args[0]).to.be.equal(chatId);
    });

    it('should process chained commands', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        const nextCommand = sinon.stubInterface<Command>();
        users.getUser.withArgs(userId).returns(user);
        commands.createCommand.withArgs('/wishlist').returns(command);
        command.process.returns(nextCommand);
        
        bot.processTextMessage({
            message_id: messageId,
            chat: {
                id: chatId,
                type: 'group',
                title: title
            },
            date: 0,
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            },
            text: '/wishlist',
            entities: [
                {
                    offset: 0,
                    length: 10,
                    type: 'bot_command'
                }
            ]
        });

        commands.createCommand.throws('');
        nextCommand.process.returns(undefined);

        bot.processTextMessage({
            message_id: messageId,
            chat: {
                id: chatId,
                type: 'private',
                title: title
            },
            date: 0,
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            },
            text: 'wishlist'
        });

        expect(nextCommand.process.called).to.be.true;
        expect(nextCommand.process.lastCall.args[0]).to.be.deep.equal({
            from: user,
            chat: {
                id: chatId,
                title: title,
                private: true
            },
            data: 'wishlist',
            args: []
        });
    });

    it('should process button', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        users.getUser.withArgs(userId).returns(user);
        buttons.createButton.withArgs('toogle').returns(button);
        
        bot.processCallbackQuery({
            id: queryId,
            chat_instance: '',
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            },
            data: 'toogle',
            message: {
                message_id: messageId,
                chat: {
                    id: chatId,
                    type: 'private',
                    title: title
                },
                date: 0
            }
        });

        expect(button.onClick.called).to.be.true;
        expect(button.onClick.lastCall.args[0]).to.be.deep.equal({
            id: queryId,
            from: user,
            chatId: chatId,
            messageId: messageId,
        });
    });

    it('should skip processing of unknown button', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        users.getUser.withArgs(userId).returns(user);
        buttons.createButton.returns(undefined);
        
        bot.processCallbackQuery({
            id: queryId,
            chat_instance: '',
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            },
            data: 'toogle',
            message: {
                message_id: messageId,
                chat: {
                    id: chatId,
                    type: 'private',
                    title: title
                },
                date: 0
            }
        });

        expect(button.onClick.called).to.be.false;
    });

    it('should skip processing of invalid query', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        users.getUser.withArgs(userId).returns(user);
        buttons.createButton.returns(undefined);
        
        bot.processCallbackQuery({
            id: queryId,
            chat_instance: '',
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            },
            data: '',
            // no message data
        });

        expect(button.onClick.called).to.be.false;
    });

    it('should notify about internal error during query processing', () => {
        const bot = new SecretSantaBot(telegram, botName, users, commands, buttons);

        users.getUser.throws('some error');
        buttons.createButton.returns(button);
        
        bot.processCallbackQuery({
            id: queryId,
            chat_instance: '',
            from: {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                is_bot: false
            },
            data: 'toogle',
            message: {
                message_id: messageId,
                chat: {
                    id: chatId,
                    type: 'private',
                    title: title
                },
                date: 0
            }
        });

        expect(telegram.answerCallbackQuery.called).to.be.true;
        expect(telegram.answerCallbackQuery.lastCall.args[0]).to.be.equal(queryId);
    });
});