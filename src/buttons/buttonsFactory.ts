import { Button } from './button';

/**
 * Transform button name to corresponding implementation
 */
export interface ButtonsFactory {
    /**
     * 
     * @param name Button name
     * 
     * @returns Undefined in case of invalid name
     */
    createButton(name: string): Button | undefined;
}