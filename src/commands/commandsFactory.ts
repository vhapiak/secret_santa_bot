import { Command } from './command';

/**
 * Transform command name to corresponding implementation
 */
export interface CommandsFactory {
    /**
     * 
     * @param name Command name
     * 
     * @returns Default command implementation in case of invalid name
     */
    createCommand(name: string | undefined): Command;
}