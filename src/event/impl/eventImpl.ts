import { ChatId, User, UserId } from '../../user/user';
import { Event, EventState, Participant } from '../event';

import fs from 'fs';

export type EventData = {
    id: ChatId;
    owner: UserId;
    name: string;
    state: EventState;
    participants: Participant[];
    budget?: string;
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

    getBudget(): string | undefined {
        return this.data.budget;
    }

    toggleParticipant(user: User): boolean {
        const index = this.data.participants.findIndex(participant => {
            return participant.user == user.getId();
        });
        if (index === -1) {
            this.data.participants.push({
                user: user.getId()
            });
            user.addActiveEvent(this.data.id);
        } else {
            this.data.participants.splice(index, 1);
            user.removeActiveEvent(this.data.id);
        }
        this.save();
        return index === -1;
    }

    setState(state: EventState): void {
        this.data.state = state;
        return this.save();
    }

    setTarget(user: UserId, target: UserId): void {
        const participant = this.data.participants.find(participant => {
            return participant.user == user;
        });
        if (!participant) {
            throw new Error(`Cannot find user ${user} in event ${this.data.id}`);
        }
        participant.target = target;
        return this.save();
    }

    setBudget(budget: string): void {
        this.data.budget = budget;
        return this.save();
    }

    save(): void {
        fs.writeFileSync(
            this.filepath, 
            JSON.stringify(this.data),
            {
                encoding: 'utf8',
                flag: 'w+'
            }
        );
    }

    static createEvent(filepath: string, id: ChatId, name: string, owner: UserId): Event {
        const data: EventData = {
            id: id,
            owner: owner,
            name: name,
            state: EventState.Registering,
            participants: []
        }
        const event = new EventImpl(filepath, data);
        event.save();
        return event;
    }

    static readFromFile(filepath: string): Event | undefined {
        if (!fs.existsSync(filepath)) {
            return undefined;
        }

        const json = fs.readFileSync(filepath, {encoding: 'utf8'});
        // @todo check read fields
        const data = JSON.parse(json) as EventData;
        return new EventImpl(filepath, data);
    }
}