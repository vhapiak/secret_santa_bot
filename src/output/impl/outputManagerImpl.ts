import TelegramBot from 'node-telegram-bot-api';
import { Event, EventState } from '../../event/event';
import { multiline } from '../../textBuilder';
import { ChatId, User } from '../../user/user';
import { UsersManager } from '../../user/usersManager';
import { ErrorMessage, InfoMessage, OutputManager, ResponseMessage } from '../outputManager';

function errorToMessage(error: ErrorMessage): string {
    switch (error) {
        case ErrorMessage.InternalError:
            return `Sorry, looks like bot is sick. Please, try again latter`;
        case ErrorMessage.AlreadyHasEvent:
            return `This group already has a Secret Santa event`;
        case ErrorMessage.NoEvent:
            return `This group doesn't have an active event\\. You can create a new one with /create`;
        case ErrorMessage.PermissionDenied:
            return `You are not permitted to execute this action`;
        case ErrorMessage.EventIsNotLaunched:
            return `Event isn't launched, use /cancel to remove it`;
        case ErrorMessage.EventAlreadyLaunched:
            return `Event already launched`;
        case ErrorMessage.NotEnoughUsers:
            return `Event must have at least 2 participants`;
        case ErrorMessage.NotAuthorizedUser:
            return multiline()
                .append( `I can't write messages to some of the participants\\.`)
                .append(`Please, ask them to send me a private message and try again`)
                .text();
        case ErrorMessage.NotPrivateChat:
            return `This command available only in private chats with me`;
    }
}

function helpMessage(): string {
    return multiline()
        .append(`Hi, I'm a Secret Santa Bot and I help people with organizing New Year events\\.`)
        .newLine()
        .newLine(`If you are event participant: just relax, I will send you all important information later\\.`)
        .newLine(`You can add your /wishlist and help your Secret Santa with choosing a present\\.`)
        .newLine(`Use /resetWishlist to reset your wishlist\\.`)
        .newLine()
        .newLine(`If you want to organize new event: just add me to the group with participants and type /create there\\.`)
        .append(`When all participants will join the event you can type /launch to assign target for each participant\\.`)
        .newLine()
        .newLine(`Other useful commands are\\:`)
        .newLine(`/status \\- to see latest state of event\\.`)
        .newLine(`/cancel \\- to cancel event \\(participants will be notified about cancellation\\)\\.`)
        .newLine(`/finish \\- to end past event and have possibility to create new one\\.`)
        .text()
}

function infoToMessage(info: InfoMessage): string {
    switch (info) {
        case InfoMessage.Help:
            return helpMessage();
        case InfoMessage.EventFinished:
            return `Event has finished, I hope it was fun\\! Now you can /create new event in this chat\\!`;
        case InfoMessage.EventCanceled:
            return `Event has canceled\\! Now you can /create new event in this chat\\!`;
        case InfoMessage.EventLaunched:
            return `Event has launched\\! Check private messages to see your target\\!`;
        case InfoMessage.WaitingForWishlist:
            return `Please send a *text* message with your wishlist\\!`;
        case InfoMessage.WishlistUpdated:
            return `Your wishlist has updated\\! It will be visible for your secret santa\\!`;
        case InfoMessage.WishlistReset:
            return `Your wishlist has deleted\\!`;
    }
}

function responseToMessage(response: ResponseMessage): string {
    switch (response) {
        case ResponseMessage.InternalError:
            return `Internal error, cannot process your request`;
        case ResponseMessage.AlreadyLaunched:
            return `Sorry, event already launched. You cannot join/leave it`;
        case ResponseMessage.EventJoined:
            return `Your have joined event`;
        case ResponseMessage.EventLeft:
            return `Your have left event`;
        case ResponseMessage.EventCanceled:
            return `This event was canceled`;
    }
}

type InteractiveMessage = {
    text: string;
    buttons: TelegramBot.InlineKeyboardButton[];
}

export class OutputManagerImpl implements OutputManager {
    constructor(
        private botName: string,
        private bot: TelegramBot, 
        private users: UsersManager) {

    }

    sendError(chat: ChatId, error: ErrorMessage): void {
        this.bot.sendMessage(
            chat, 
            errorToMessage(error),
            {
                parse_mode: 'MarkdownV2'
            });
    }

    sendInfo(chat: ChatId, info: InfoMessage): void {
        this.bot.sendMessage(
            chat, 
            infoToMessage(info),
            {
                parse_mode: 'MarkdownV2'
            });
    }

    sendEvent(chat: ChatId, event: Event): void {
        const message = this.renderEventMessage(event);
        this.bot.sendMessage(
            chat,
            message.text,
            {
                parse_mode: 'MarkdownV2', 
                reply_markup: {
                    inline_keyboard: [message.buttons]
                }
            });
    }

    sendTarget(chat: ChatId, event: Event, target: User): void {
        const builder = multiline()
            .append(`Secret santa event in _${event.getName()}_ has launched\\.`)
            .append(`You should prepare a present for [${target.getName()}](tg://user?id=${target.getId()})`)
            .newLine();

        const wishlist = target.getWishlist();
        if (wishlist) {
            builder
                .newLine(`Wishlist of [${target.getName()}](tg://user?id=${target.getId()}):`)
                .newLine(this.escapeTelegramSymbols(wishlist));
        } else {
            builder.newLine(`Unfortunately, this person doesn't have a wishlist\\!`);
        }
        
        this.bot.sendMessage(
            chat,
            builder.text(),
            {
                parse_mode: 'MarkdownV2'
            });
    }

    sendEventCancellation(chat: ChatId, event: Event): void {
        const message = multiline().
            append(`Secret Santa event has canceled in group _${event.getName()}_\\.`)
            .newLine(`Ignore all previous messages regarding this group`)
            .text();

        this.bot.sendMessage(
            chat,
            message,
            {
                parse_mode: 'MarkdownV2'
            });
    }

    sendWishlistUpdate(chat: ChatId, user: User): void {
        const message = multiline()
            .append(`[${user.getName()}](tg://user?id=${user.getId()}) `);
        const wishlist = user.getWishlist();
        if (wishlist) {
            message
                .append(`has updated their wishlist:`)
                .newLine()
                .newLine(this.escapeTelegramSymbols(wishlist));
        } else {
            message.append(`has reset their wishlist`);
        }

        this.bot.sendMessage(
            chat,
            message.text(),
            {
                parse_mode: 'MarkdownV2'
            });
    }

    updateEvent(chat: ChatId, messageId: number, event: Event): void {
        const message = this.renderEventMessage(event);
        this.bot.editMessageText(
            message.text, 
            {
                chat_id: chat,
                message_id: messageId,
                parse_mode: 'MarkdownV2', 
                reply_markup: {
                    inline_keyboard: [message.buttons]
                }
            });
    }

    cancelEvent(chat: ChatId, messageId: number): void {
        const message = `_Event canceled_`;
        this.bot.editMessageText(
            message, 
            {
                chat_id: chat,
                message_id: messageId,
                parse_mode: 'MarkdownV2', 
                reply_markup: {
                    inline_keyboard: [[]]
                }
            });
    }

    responseOnClick(request: string, response: ResponseMessage): void {
        this.bot.answerCallbackQuery(
            request, 
            {
                text: responseToMessage(response)
            });
    }

    private renderEventMessage(event: Event): InteractiveMessage {
        return {
            text: this.renderEventText(event),
            buttons: this.renderEventButtons(event)
        };
    }

    private renderEventText(event: Event): string {
        const status = event.getState() === EventState.Launched ? 'Launched' : 'Registering';
        const owner = this.users.getUser(event.getOwner());
        if (!owner) {
            throw new Error('Cannot find owner information');
        }

        let builder = multiline()
            .append(`*Secret Santa Event*`)
            .newLine()
            .newLine(`*Owner:* [${owner.getName()}](tg://user?id=${owner.getId()})`)
            .newLine(`*Status:* _${status}_`)
            .newLine()
            .newLine(`*Participants:*`);
    
        const participants = event.getParticipants();
        if (participants.length === 0) {
            builder.newLine(`_Currently there are no participants :\\(_`);
        }
    
        let hasUnregistredUser = false;
        for (let i = 0; i < participants.length; ++i) {
            const user = this.users.getUser(participants[i].user);
            if (user) {
                builder.newLine(`${i + 1}\\. [${user.getName()}](tg://user?id=${user.getId()})`);
                if (user.getChatId() === undefined) {
                    hasUnregistredUser = true;
                    builder.append(`\u{1F6AB}`);
                }
            }
        }

        if (hasUnregistredUser) {
            builder
                .newLine()
                .newLine(`_Users with \u{1F6AB} should write [message](https://t\\.me/${this.botName})`)
                .append(`to me to allow notifications\\.`)
                .append(`Until then event can't be launched\\._`);
        }
        
        return builder.text();
    }

    private renderEventButtons(event: Event): TelegramBot.InlineKeyboardButton[] {
        if (event.getState() === EventState.Launched) {
            return [];
        }
        return [{text: 'Join/Leave', callback_data: 'toggle'}];
    }

    private escapeTelegramSymbols(str: string): string {
        return str
            .replace(/\_/g, '\\_')
            .replace(/\*/g, '\\*')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/\~/g, '\\~')
            .replace(/\`/g, '\\`')
            .replace(/\>/g, '\\>')
            .replace(/\</g, '\\<')
            .replace(/\#/g, '\\#')
            .replace(/\+/g, '\\+')
            .replace(/\-/g, '\\-')
            .replace(/\=/g, '\\=')
            .replace(/\|/g, '\\|')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\./g, '\\.')
            .replace(/\!/g, '\\!');
    }
}