
export type UserId = number;
export type ChatId = number;
export type EventId = ChatId;

export interface User {
    getId(): UserId;
    getName(): string;
    getChatId(): ChatId | undefined;
    getWishlist(): string | undefined;
    getActiveEvents(): EventId[];

    /**
     * @brief User's telegram chat is unavailable by default,
     *          user should write direct message to bot.
     * 
     * @param chatId Telegram chat id for private messaging with user
     */
    bindChat(chatId: ChatId): void;

    setWishlist(wishlist: string | undefined): void;

    addActiveEvent(eventId: EventId): void;
    removeActiveEvent(eventId: EventId): void;
}