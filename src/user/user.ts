
export type UserId = number;
export type ChatId = number;

export interface User {
    getId(): UserId;
    getName(): string;
    getChatId(): ChatId | undefined;
    getWishlist(): string | undefined;

    /**
     * @brief User's telegram chat is unavailable by default,
     *          user should write direct message to bot.
     * 
     * @param chatId Telegram chat id for private messaging with user
     */
    bindChat(chatId: ChatId): void;

    setWitshlist(wishlist: string | undefined): void;
}