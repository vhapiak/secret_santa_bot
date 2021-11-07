/**
 * Manual test to check how bot output looks 
 * in telegram clients.
 */

import * as sinon from 'ts-sinon';

import TelegramBot from 'node-telegram-bot-api';
import { OutputManagerImpl } from '../src/output/impl/outputManagerImpl';
import { UsersManager } from '../src/user/usersManager';
import { CommandsFactory } from '../src/commands/commandsFactory';
import { ButtonsFactory } from '../src/buttons/buttonsFactory';
import { SecretSantaBot } from '../src/secretSantaBot';
import { Command, Message } from '../src/commands/command';
import { ErrorMessage, InfoMessage, OutputManager, ResponseMessage } from '../src/output/outputManager';
import { User } from '../src/user/user';
import { Event, EventState } from '../src/event/event';
import { Button, Request } from '../src/buttons/button';

const users = sinon.stubInterface<UsersManager>();
const firstUser = sinon.stubInterface<User>();
const secondUser = sinon.stubInterface<User>();
const thirdUser = sinon.stubInterface<User>();

const eventWithNoParticipants = sinon.stubInterface<Event>();
const notLaunchedEvent = sinon.stubInterface<Event>();
const launchedEvent = sinon.stubInterface<Event>();

users.getUser.withArgs(0).returns(firstUser);
users.getUser.withArgs(1).returns(secondUser);
users.getUser.withArgs(2).returns(thirdUser);

firstUser.getName.returns('John Doe');
firstUser.getChatId.returns(0);
secondUser.getName.returns('John Galt');
secondUser.getChatId.returns(undefined);
thirdUser.getName.returns('Davy Jones');
thirdUser.getChatId.returns(0);

eventWithNoParticipants.getOwner.returns(0);
eventWithNoParticipants.getState.returns(EventState.Registering);
eventWithNoParticipants.getParticipants.returns([]);

notLaunchedEvent.getOwner.returns(0);
notLaunchedEvent.getState.returns(EventState.Registering);
notLaunchedEvent.getParticipants.returns([
    {user: 0},
    {user: 1},
    {user: 2},
]);

launchedEvent.getOwner.returns(0);
launchedEvent.getState.returns(EventState.Launched);
launchedEvent.getName.returns('Group Name');
launchedEvent.getParticipants.returns([
    {user: 0},
    {user: 2},
]);

/**
 * Command that print all messages to check how they look in telegram
 */
class StubCommand implements Command {
    constructor(private output: OutputManager) {

    }

    process(message: Message): Command | undefined {
        this.processImpl(message);
        return undefined;
    }

    private async processImpl(message: Message) {
        this.output.sendError(message.chat.id, ErrorMessage.AlreadyHasEvent);
        await delay(100);
        this.output.sendError(message.chat.id, ErrorMessage.EventAlreadyLaunched);
        await delay(100);
        this.output.sendError(message.chat.id, ErrorMessage.EventIsNotLaunched);
        await delay(100);
        this.output.sendError(message.chat.id, ErrorMessage.InternalError);
        await delay(100);
        this.output.sendError(message.chat.id, ErrorMessage.NoEvent);
        await delay(100);
        this.output.sendError(message.chat.id, ErrorMessage.NotAuthorizedUser);
        await delay(100);
        this.output.sendError(message.chat.id, ErrorMessage.NotEnoughUsers);
        await delay(100);
        this.output.sendError(message.chat.id, ErrorMessage.NotPrivateChat);
        await delay(100);
        this.output.sendError(message.chat.id, ErrorMessage.PermissionDenied);
        await delay(100);

        this.output.sendInfo(message.chat.id, InfoMessage.EventCanceled);
        await delay(100);
        this.output.sendInfo(message.chat.id, InfoMessage.EventFinished);
        await delay(100);
        this.output.sendInfo(message.chat.id, InfoMessage.EventLaunched);
        await delay(100);
        this.output.sendInfo(message.chat.id, InfoMessage.Help);
        await delay(100);
        this.output.sendInfo(message.chat.id, InfoMessage.WaitingForWishlist);
        await delay(100);
        this.output.sendInfo(message.chat.id, InfoMessage.WishlistReset);
        await delay(100);
        this.output.sendInfo(message.chat.id, InfoMessage.WishlistUpdated);
        await delay(100);

        this.output.sendEvent(message.chat.id, eventWithNoParticipants);
        await delay(100);
        this.output.sendEvent(message.chat.id, notLaunchedEvent);
        await delay(100);
        this.output.sendEvent(message.chat.id, launchedEvent);
        await delay(100);

        this.output.sendEventCancellation(message.chat.id, launchedEvent);
        await delay(100);

        this.output.sendTarget(message.chat.id, launchedEvent, firstUser);
        await delay(100);

        thirdUser.getWishlist.returns(message.data);
        this.output.sendTarget(message.chat.id, launchedEvent, thirdUser);
        await delay(100);

        this.output.sendWishlistUpdate(message.chat.id, firstUser);
        await delay(100);

        this.output.sendWishlistUpdate(message.chat.id, thirdUser);
        await delay(100);
    }
}

/**
 * Replace event message with launched event message
 */
class StubButton implements Button {
    constructor(private output: OutputManager) {

    }

    onClick(request: Request): void {
        this.output.updateEvent(request.chatId, request.messageId, launchedEvent);
        this.output.responseOnClick(request.id, ResponseMessage.AlreadyLaunched);
    }
}

/**
 * Method to run bot that process single command and button
 */
function main(argv: string[]) {
    if (argv.length < 4) {
        console.log('Usage: main.js <telegram-name> <telegram-token>');
        return;
    }
    
    const botName = argv[2];
    const botToken = argv[3];

    const telegram = new TelegramBot(botToken);
    const output = new OutputManagerImpl(botName, telegram, users);

    const commandsFactory = sinon.stubInterface<CommandsFactory>();
    const buttonsFactory = sinon.stubInterface<ButtonsFactory>();

    commandsFactory.createCommand.returns(new StubCommand(output));
    buttonsFactory.createButton.returns(new StubButton(output));
    users.getUser.returns(firstUser);

    const secretSantaBot = new SecretSantaBot(
        telegram,
        botName,
        users,
        commandsFactory,
        buttonsFactory
    );

    telegram.on('text', (msg: TelegramBot.Message) => {
        secretSantaBot.processTextMessage(msg);
    });

    telegram.on('callback_query', (query: TelegramBot.CallbackQuery) => {
        secretSantaBot.processCallbackQuery(query);
    });

    telegram.startPolling();
}

async function delay(t: number): Promise<void> {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, t);
    });
 }

main(process.argv);
