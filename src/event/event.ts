import { ChatId, User, UserId } from '../user/user';

export enum EventState {
    Registering, // participants can join and leave event
    Launched // targets are assigned to participants, list of participants can not be changed 
}

export type Participant = {
    user: UserId;
    target?: UserId;
}

export interface Event {
    /**
     * @returns Event id is equal to telegram chat id to which this event belongs 
     */
    getId(): ChatId;

    /**
     * @returns Id of event creator
     */
    getOwner(): UserId;

    getName(): string;
    getState(): EventState;
    getParticipants(): Participant[];
    getBudget(): string | undefined;

    /**
     * @brief Add user to participants or remove him from them if user already in list
     * 
     * @param id Telegram user id to toggle
     * 
     * @return true if user was added to list
     */
    toggleParticipant(user: User): boolean;

    setState(state: EventState): void;
    setTarget(user: UserId, target: UserId): void;
    setBudget(budget: string): void;
}