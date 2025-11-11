import { Context } from '../../context';
import { EventState, Participant } from '../../event/event';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { ChatId, User } from '../../user/user';
import { Command, Message } from '../command';

type Targets = {
    user: User;
    target: User;
};

/**
 * Generates random unique pairs.
 * 
 * @param users Event participants
 * @returns Pairs of users. `user` is Secret Santa of `target`
 */
export function generateTargets(users: User[]): Targets[] {
    // shuffling
    for (let i = users.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = users[i];
        users[i] = users[j];
        users[j] = tmp;
    }

    // user in the list is a target for previous (list is cycled) user
    const targets: Targets[] = [];
    for (let i = 0; i < users.length; ++i) {
        let next = (i + 1) % users.length;
        targets.push({
            user: users[i],
            target: users[next]
        });
    }

    return targets;
}

/**
 * Generates target for each user and send them 
 * to private messages
 */
export class LaunchCommand implements Command {
    constructor(private context: Context) {

    }

    process(message: Message): Promise<Command | undefined> {
        const event = this.context.events.getEvent(message.chat.id);
        if (!event) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NoEvent);
            return Promise.resolve(undefined);
        }

        if (event.getOwner() !== message.from.getId()) {
            this.context.output.sendError(message.chat.id, ErrorMessage.PermissionDenied);
            return Promise.resolve(undefined);
        }

        if (event.getState() === EventState.Launched) {
            this.context.output.sendError(message.chat.id, ErrorMessage.EventAlreadyLaunched);
            return Promise.resolve(undefined);
        }

        if (event.getParticipants().length < 2) {
            this.context.output.sendError(message.chat.id, ErrorMessage.NotEnoughUsers);
            return Promise.resolve(undefined);
        }

        const users = this.getUsers(event.getParticipants());
        if (!this.isAllUsersHaveChat(users)) {
            this.context.output.sendEvent(message.chat.id, event);
            this.context.output.sendError(message.chat.id, ErrorMessage.NotAuthorizedUser);
            return Promise.resolve(undefined);
        }
 
        const targets = generateTargets(users);

        event.setState(EventState.Launched);

        targets.forEach(pair => {
            const chatId = pair.user.getChatId() as ChatId;
            event.setTarget(pair.user.getId(), pair.target.getId());
            this.context.output.sendTarget(chatId, event, pair.target);
        });

        this.context.output.sendInfo(message.chat.id, InfoMessage.EventLaunched);

        return Promise.resolve(undefined);
    }

    private getUsers(participants: Participant[]): User[] {
        const users: User[] = participants.map(participant => {
            return this.context.users.getUser(participant.user) as User;
        });
        return users;
    }

    private isAllUsersHaveChat(users: User[]): boolean {
        return users.every(user => {
            return user.getChatId() !== undefined;
        });
    }
}