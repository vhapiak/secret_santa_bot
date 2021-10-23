import { ChatId, UserId } from '../user/user';
import { Event, EventState, Participant } from './event';

import fs from 'fs';

export type EventData = {
    id: ChatId;
    owner: UserId;
    name: string;
    state: EventState;
    participants: Participant[];
}

export class EventImpl implements Event {
    constructor(private filepath: string, private data: EventData) {
    }

    getId(): ChatId {
        return this.data.id;
    }

    getOwner(): UserId {
        return this.data.owner;
    }

    getName(): string {
        return this.data.name;
    }

    getState(): EventState {
        return this.data.state;
    }

    getParticipants(): Participant[] {
        return this.data.participants;
    }

    async toogleParticipant(id: UserId): Promise<boolean> {
        const index = this.data.participants.findIndex(participant => {
            return participant.user == id;
        });
        if (index === -1) {
            this.data.participants.push({
                user: id
            });
        } else {
            this.data.participants.splice(index, 1);
        }
        await this.save();
        return index === -1;
    }

    async setState(state: EventState): Promise<void> {
        this.data.state = state;
        return this.save();
    }

    async setTarget(user: UserId, target: UserId): Promise<void> {
        const participant = this.data.participants.find(participant => {
            return participant.user == user;
        });
        if (!participant) {
            throw new Error(`Cannot find user ${user} in event ${this.data.id}`);
        }
        participant.target = target;
        return this.save();
    }

    async save(): Promise<void> {
        return fs.promises.writeFile(
            this.filepath, 
            JSON.stringify(this.data),
            {
                encoding: 'utf8',
                flag: 'w+'
            }
        );
    }

    static async createEvent(filepath: string, id: ChatId, name: string, owner: UserId): Promise<Event> {
        const data: EventData = {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Registering,
            participants: []
        }
        const event = new EventImpl(filepath, data);
        await event.save();
        return event;
    }

    static async readFromFile(filepath: string): Promise<Event | undefined> {
        if (!fs.existsSync(filepath)) {
            return undefined;
        }

        const json = await fs.promises.readFile(filepath, {encoding: 'utf8'});
        // @todo check read fields
        const data = JSON.parse(json) as EventData;
        return new EventImpl(filepath, data);
    }
}