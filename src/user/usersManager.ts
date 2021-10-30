import { User, UserId } from './user';

export interface UsersManager {
    /**
     * @brief Create user and save it to db
     * 
     * @param id User telegram id
     * @param name User telegram name
     */
    addUser(id: UserId, name: string): User;

    /**
     * @brief Find user in db by telegram id
     * 
     * @param id User telegram id
     * 
     * @returns undefined if such user doesn't exist
     */
    getUser(id: UserId): User | undefined;
}