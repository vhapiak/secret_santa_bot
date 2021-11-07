import { Context } from "../../context";
import { User } from "../../user/user";

export class CommandUtils {
    /**
     * Sends update about wishlist changes to user,
     * who is a secret santa of specified user
     * @param user User who updated wishlist
     * @param context 
     */
    static sendWishlistUpdate (user: User, context: Context) {
        user.getActiveEvents().forEach(eventId => {
            const event = context.events.getEvent(eventId);
            event?.getParticipants().forEach(participant => {
                if (participant.target === user.getId()) {
                    const santa = context.users.getUser(participant.user);
                    const chatId = santa?.getChatId();
                    if (chatId) {
                        context.output.sendWishlistUpdate(chatId, user);
                    }
                    return;
                }
            });
        });
    }
}
