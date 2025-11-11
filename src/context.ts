import { EventsManager } from './event/eventsManager';
import { OutputManager } from './output/outputManager';
import { Service } from './service/service';
import { UsersManager } from './user/usersManager';

/**
 * Supportive struct to reduce number of arguments
 */
export type Context = {
    service: Service;
    users: UsersManager;
    events: EventsManager;
    output: OutputManager;
}