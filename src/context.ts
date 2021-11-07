import { EventsManager } from './event/eventsManager';
import { OutputManager } from './output/outputManager';
import { UsersManager } from './user/usersManager';

/**
 * Supportive struct to reduce number of arguments
 */
export type Context = {
    users: UsersManager;
    events: EventsManager;
    output: OutputManager;
}