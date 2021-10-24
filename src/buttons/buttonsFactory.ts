import { Button } from './button';

export interface ButtonsFactory {
    createButtonProcessor(name: string): Button | undefined;
}