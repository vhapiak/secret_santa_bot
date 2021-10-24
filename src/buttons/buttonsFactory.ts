import { Button } from './button';

export interface ButtonsFactory {
    createButton(name: string): Button | undefined;
}