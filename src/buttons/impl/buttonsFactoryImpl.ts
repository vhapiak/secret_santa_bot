import { ButtonsFactory } from '../buttonsFactory';
import { Button } from '../button';
import { Context } from '../../context';
import { ToggleButton } from './toggleButton';

export class ButtonsFactoryImpl implements ButtonsFactory {
    constructor(private context: Context) {

    }

    createButton(name: string): Button | undefined {
        switch (name) {
            case 'toggle':
                return new ToggleButton(this.context);
        }
        return undefined;
    }
}