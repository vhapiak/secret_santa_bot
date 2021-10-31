import { ChatId, UserId } from '../../user/user';
import { EventImpl } from './eventImpl';
import { EventsManager } from '../eventsManager';
import { Event } from '../event';

import fs from 'fs';
import path from 'path';
import { UsersManager } from '../../user/usersManager';

export class EventsManagerImpl implements EventsManager {
    constructor(root: string, private users: UsersManager) {
        this.directory = path.join(root, 'events');
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, {recursive: true});
        }
    }

    addEvent(id: ChatId, name: string, owner: UserId): Event {
        return EventImpl.createEvent(this.makeFilepath(id), id, name, owner);
    }

    getEvent(id: ChatId): Event | undefined {
        return EventImpl.readFromFile(this.makeFilepath(id));
    }

    removeEvent(id: ChatId): void {
        const filepath = this.makeFilepath(id);
        const event = EventImpl.readFromFile(filepath);
        if (event) {
            event.getParticipants().forEach(participant => {
                const user = this.users.getUser(participant.user);
                if (user) {
                    user.removeActiveEvent(id);
                }
            });
        }
        return fs.rmSync(filepath);
    }

    private makeFilepath(id: ChatId): string {
        return path.join(this.directory, id + '.json');
    }

    private directory: string;
}