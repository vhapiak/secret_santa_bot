
export interface User {
    getId(): number;
    getName(): string;
    getChatId(): number | undefined;

    /**
     * @brief User's telegram chat is unavailable by default,
     *          user should write direct message to bot.
     * 
     * @param chatId Telegram chat id for private messaging with user
     */
    bindChat(chatId: number): Promise<void>;
}