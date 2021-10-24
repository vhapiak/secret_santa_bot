import { Command } from './command';

export interface CommandsFactory {
    createCommand(name: string | undefined): Command;
}