import { EventsManager } from './event/eventsManager';
import { OutputManager } from './output/outputManager';
import { UsersManager } from './user/usersManager';

export type Context = {
    users: UsersManager;
    events: EventsManager;
    output: OutputManager;
}