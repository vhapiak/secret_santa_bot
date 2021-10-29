
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
    const any = sinon.default.match.any;
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

    it('should process command', async () => {
        const bot = new SecretSantaBot(telegram, users, commands, buttons);

        users.getUser.withArgs(userId).returns(Promise.resolve(user));
        commands.createCommand.withArgs('/launch').returns(command);
        
        await bot.processTextMessage({
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
                title: title
            },
            data: '/launch'
        });
    });

    it('should process default command', async () => {
        const bot = new SecretSantaBot(telegram, users, commands, buttons);

        users.getUser.withArgs(userId).returns(Promise.resolve(user));
        commands.createCommand.withArgs(undefined).returns(command);
        
        await bot.processTextMessage({
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
            }
        });

        expect(command.process.called).to.be.true;
        expect(command.process.lastCall.args[0]).to.be.deep.equal({
            from: user,
            chat: {
                id: chatId,
                title: title
            },
            data: ''
        });
    });

    it('should register user and bind chat', async () => {
        const bot = new SecretSantaBot(telegram, users, commands, buttons);

        users.getUser.withArgs(userId).returns(Promise.resolve(undefined));
        users.addUser.withArgs(userId, `${firstName} ${lastName}`).returns(Promise.resolve(user));
        commands.createCommand.returns(command);
        
        await bot.processTextMessage({
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

    it('should skip process invalid message', async () => {
        const bot = new SecretSantaBot(telegram, users, commands, buttons);
        
        await bot.processTextMessage({
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

    it('should notify about internal error during message processing', async () => {
        const bot = new SecretSantaBot(telegram, users, commands, buttons);
        
        users.getUser.returns(Promise.reject());

        await bot.processTextMessage({
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

    it('should process button', async () => {
        const bot = new SecretSantaBot(telegram, users, commands, buttons);

        users.getUser.withArgs(userId).returns(Promise.resolve(user));
        buttons.createButton.withArgs('toogle').returns(button);
        
        await bot.processCallbackQuery({
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

        expect(button.process.called).to.be.true;
        expect(button.process.lastCall.args[0]).to.be.deep.equal({
            id: queryId,
            from: user,
            chatId: chatId,
            messageId: messageId,
        });
    });

    it('should skip process unknown button', async () => {
        const bot = new SecretSantaBot(telegram, users, commands, buttons);

        users.getUser.withArgs(userId).returns(Promise.resolve(user));
        buttons.createButton.returns(undefined);
        
        await bot.processCallbackQuery({
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

        expect(button.process.called).to.be.false;
    });

    it('should skip process invalid query', async () => {
        const bot = new SecretSantaBot(telegram, users, commands, buttons);

        users.getUser.withArgs(userId).returns(Promise.resolve(user));
        buttons.createButton.returns(undefined);
        
        await bot.processCallbackQuery({
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

        expect(button.process.called).to.be.false;
    });

    it('should notify about internal error during query processing', async () => {
        const bot = new SecretSantaBot(telegram, users, commands, buttons);

        users.getUser.withArgs(userId).returns(Promise.reject());
        buttons.createButton.returns(button);
        
        await bot.processCallbackQuery({
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