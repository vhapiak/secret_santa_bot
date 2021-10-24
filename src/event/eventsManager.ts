import { ChatId, UserId } from '../user/user';
import { Event } from './event';

export interface EventsManager {
    /**
     * @brief Create event and save it to db
     * 
     * @param id Telegram chat id to which this event belongs
     * @param name Telegram chat title
     * @param owner User who created this event
     */
    addEvent(id: ChatId, name: string, owner: UserId): Promise<Event>;

    /**
     * @brief Find event by chat id
     * 
     * @param id Telegram chat id
     * 
     * @returns undefined if there is no event attached to chat
     */
    getEvent(id: ChatId): Promise<Event | undefined>;

    /**
     * @brief Remove event from db
     * 
     * @param id Telegram chat id 
     */
    removeEvent(id: ChatId): Promise<void>;
}