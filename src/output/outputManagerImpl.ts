import TelegramBot from 'node-telegram-bot-api';
import { Event, EventState } from '../event/event';
import { multiline } from '../textBuilder';
import { ChatId, User } from '../user/user';
import { UsersManager } from '../user/usersManager';
import { ErrorMessage, InfoMessage, OutputManager, ResponseMessage } from './outputManager';

function errorToMessage(error: ErrorMessage): string {
    switch (error) {
        case ErrorMessage.InternalError:
            return `Sorry, looks like bot is sick, please, try latter`;
        case ErrorMessage.AlreadyHasEvent:
            return `This group already has secret santa event`;
        case ErrorMessage.NoEvent:
            return `This group doesn't have active event. You can create new one with /create`;
        case ErrorMessage.PermissionDenied:
            return `You are not permitted to execute this operation`;
        case ErrorMessage.EventIsNotLaunched:
            return `Event isn't launched, use /cancel to remove it`;
    }
}

function helpMessage(): string {
    return multiline()
        .append(`Hi, I'm a Secret Santa Bot and I help people with orginizing New Year events.`)
        .newLine()
        .newLine(`If you are event participant: just relax, I will send you all important information later.`)
        .newLine()
        .newLine(`If you want to orginize new event: just add me to group with participants and type /create there.`)
        .append(`When all participants will join event you can type /launch to assign target for each participant.`)
        .newLine()
        .newLine(`Other usefull commands are:`)
        .newLine(`/status - to see latest state of event.`)
        .newLine(`/cancel - to cancel event (participants will be notified about cancelation).`)
        .newLine(`/finish - to end past event and have possibility to create new one.`)
        .text()
}

function infoToMessage(info: InfoMessage): string {
    switch (info) {
        case InfoMessage.Help:
            return helpMessage();
        case InfoMessage.EventFinished:
            return `Event has finished, I hope it was fun! Now you can /create new event in this chat!`;
        case InfoMessage.EventCanceled:
            return `Event has canceled! Now you can /create new event in this chat!`;
    }
}

function responseToMessage(response: ResponseMessage): string {
    switch (response) {
        case ResponseMessage.InternalError:
            return `Internal error, cannot process your request`;
        case ResponseMessage.AlreadyLaunched:
            return `Sorry, event already launched. You cannot join/leave it`;
        case ResponseMessage.EventJoined:
            return 'Your have joined event';
        case ResponseMessage.EventLeft:
            return 'Your have left event';
    }
}

type InteractiveMessage = {
    text: string;
    buttons: TelegramBot.InlineKeyboardButton[];
}

export class OutputManagerImpl implements OutputManager {
    constructor(private bot: TelegramBot, private users: UsersManager) {

    }

    async sendError(chat: ChatId, error: ErrorMessage): Promise<void> {
        this.bot.sendMessage(
            chat, 
            errorToMessage(error));
    }

    async sendInfo(chat: ChatId, info: InfoMessage): Promise<void> {
        this.bot.sendMessage(
            chat, 
            infoToMessage(info));
    }

    async sendEvent(chat: ChatId, event: Event): Promise<void> {
        const message = await this.renderEventMessage(event);
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

    async sendTarget(chat: ChatId, event: Event, target: User): Promise<void> {
        const message = multiline()
            .append(`Secret santa event in _${event.getName()}_ has been laucnhed.`)
            .append(`You should prepare present for [${target.getName()}](tg://user?id=${target.getId()})`)
            .text();
        
        this.bot.sendMessage(
            chat,
            message,
            {
                parse_mode: 'MarkdownV2'
            });
    }

    async sendEventCancelation(chat: ChatId, event: Event): Promise<void> {
        const message = multiline().
            append(`Secret Santa event has canceled in group _${event.getName()}_.`)
            .newLine(`Ignore all previous messages regarding this group.`)
            .text();

        this.bot.sendMessage(
            chat,
            message,
            {
                parse_mode: 'MarkdownV2'
            });
    }

    async updateEvent(chat: ChatId, messageId: number, event: Event): Promise<void> {
        const message = await this.renderEventMessage(event);
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

    async responseOnClick(request: string, response: ResponseMessage): Promise<void> {
        this.bot.answerCallbackQuery(
            request, 
            {
                text: responseToMessage(response)
            });
    }

    private async renderEventMessage(event: Event): Promise<InteractiveMessage> {
        return {
            text: await this.renderEventText(event),
            buttons: this.renderEventButtons(event)
        };
    }

    private async renderEventText(event: Event): Promise<string> {
        const status = event.getState() === EventState.Launched ? 'Laucnhed' : 'Registering';
        const owner = await this.users.getUser(event.getOwner());
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
    
        for (let i = 0; i < participants.length; ++i) {
            const user = await this.users.getUser(participants[i].user);
            if (!user) {
                throw new Error('Cannot find user information');
            }
            builder.newLine(`${i + 1}\\. [${user.getName()}](tg://user?id=${user.getId()})\n`);
        }
        
        return builder.text();
    }

    private renderEventButtons(event: Event): TelegramBot.InlineKeyboardButton[] {
        if (event.getState() === EventState.Launched) {
            return [];
        }
        return [{text: 'Join/Leave', callback_data: 'toogle'}];
    }
}