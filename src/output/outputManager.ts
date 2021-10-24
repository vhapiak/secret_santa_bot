import { Event } from '../event/event';
import { ChatId, User } from '../user/user';

export enum ErrorMessage {
    InternalError,
    NoEvent,
    AlreadyHasEvent,
    PermissionDenied,
    EventIsNotLaunched,
}

export enum InfoMessage {
    Help,
    EventFinished,
}

export enum ResponseMessage {
    InternalError,
    AlreadyLaunched,
    EventJoined,
    EventLeft,
}

export interface OutputManager {
    sendError(chat: ChatId, error: ErrorMessage): Promise<void>;
    sendInfo(char: ChatId, info: InfoMessage): Promise<void>;

    sendEvent(chat: ChatId, event: Event): Promise<void>;
    sendTarget(chat: ChatId, event: Event, target: User): Promise<void>;

    /**
     * @brief Updates existing telegram message with new event state
     * 
     * @param chat Telegram chat id with message to update
     * @param message Telegram message id with event information
     * @param event New event state
     */
    updateEvent(chat: ChatId, message: number, event: Event): Promise<void>;

    /**
     * @brief Send reaction in response to button click
     * 
     * @param request Telegram identifier of button click
     * @param response Result of button click processing
     */
    responseOnClick(request: string, response: ResponseMessage): Promise<void>;
}