import { User } from './user';

export interface UsersManager {
    /**
     * @brief Create user and save it to db
     * 
     * @param id User telegram id
     * @param name User telegram name
     */
    addUser(id: number, name: string): Promise<User>;

    /**
     * @brief Find user in db by telegram id
     * 
     * @param id User telegram id
     * 
     * @returns undefined if such user doesn't exist
     */
    getUser(id: number): Promise<User | undefined>;
}