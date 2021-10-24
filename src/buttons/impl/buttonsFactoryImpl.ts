import { ButtonsFactory } from '../buttonsFactory';
import { Button } from '../button';
import { Context } from '../../context';
import { ToogleButton } from './toogleButton';

export class ButtonsFactoryImpl implements ButtonsFactory {
    constructor(private context: Context) {

    }

    createButton(name: string): Button | undefined {
        switch (name) {
            case 'toogle':
                return new ToogleButton(this.context);
        }
        return undefined;
    }
}