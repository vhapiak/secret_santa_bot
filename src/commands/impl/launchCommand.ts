import { Context } from '../../context';
import { EventState, Participant } from '../../event/event';
import { ErrorMessage, InfoMessage } from '../../output/outputManager';
import { ChatId, User } from '../../user/user';
import { Command, Message } from '../command';

type Targets = {
    user: User;
    target: User;
};

export function generateTargets(users: User[]): Targets[] {
    for (let i = users.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = users[i];
        users[i] = users[j];
        users[j] = tmp;
    }

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

export class LaunchCommand implements Command {
    constructor(private context: Context) {

    }

    async process(message: Message): Promise<Command | undefined> {
        const event = await this.context.events.getEvent(message.chat.id);
        if (!event) {
            await this.context.output.sendError(message.chat.id, ErrorMessage.NoEvent);
            return undefined;
        }

        if (event.getOwner() !== message.from.getId()) {
            await this.context.output.sendError(message.chat.id, ErrorMessage.PermissionDenied);
            return undefined;
        }

        if (event.getState() === EventState.Launched) {
            await this.context.output.sendError(message.chat.id, ErrorMessage.EventAlreadyLaunched);
            return undefined;
        }

        if (event.getParticipants().length < 2) {
            await this.context.output.sendError(message.chat.id, ErrorMessage.NotEnoughUsers);
            return undefined;
        }

        const users = await this.getUsers(event.getParticipants());
        if (!this.isAllUsersHaveChat(users)) {
            await this.context.output.sendEvent(message.chat.id, event);
            await this.context.output.sendError(message.chat.id, ErrorMessage.NotAuthorizedUser);
            return undefined;
        }
 
        const targets = generateTargets(users);

        await event.setState(EventState.Launched);
        for (let i = 0; i < targets.length; ++i) {
            const pair = targets[i];
            const chatId = pair.user.getChatId() as ChatId;

            await event.setTarget(pair.user.getId(), pair.target.getId());
            await this.context.output.sendTarget(chatId, event, pair.target);
        }

        await this.context.output.sendInfo(message.chat.id, InfoMessage.EventLaunched);

        return undefined;
    }

    private async getUsers(participants: Participant[]): Promise<User[]> {
        const users: User[] = [];
        for (let i = 0; i < participants.length; ++i) {
            const participant = participants[i];
            const user = await this.context.users.getUser(participant.user);
            if (!user) {
                throw new Error(`Cannot find user with id ${participant.user}`);
            }
            users.push(user);
        }
        return users;
    }

    private isAllUsersHaveChat(users: User[]): boolean {
        return users.every(user => {
            return user.getChatId() !== undefined;
        });
    }
}