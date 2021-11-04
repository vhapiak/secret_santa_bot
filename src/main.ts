import TelegramBot from 'node-telegram-bot-api';
import { ButtonsFactoryImpl } from './buttons/impl/buttonsFactoryImpl';
import { CommandsFactoryImpl } from './commands/impl/commandsFactoryImpl';
import { Context } from './context';
import { EventsManagerImpl } from './event/impl/eventsManagerImpl';
import { OutputManagerImpl } from './output/impl/outputManagerImpl';
import { SecretSantaBot } from './secretSantaBot';
import { UsersManagerImpl } from './user/impl/usersManagerImpl';

function main(argv: string[]) {
    if (argv.length < 5) {
        console.log('Usage: main.js <telegram-name> <telegram-token> <db-directory>');
        return;
    }
    
    const telegram = new TelegramBot(argv[3]);
    const users = new UsersManagerImpl(argv[4]);
    const events = new EventsManagerImpl(argv[4], users);
    const output = new OutputManagerImpl(argv[2], telegram, users);
    const context: Context = {
        users: users,
        events: events,
        output: output
    };

    const commandsFactory = new CommandsFactoryImpl(context);
    const buttonsFactory = new ButtonsFactoryImpl(context);
    
    const secretSantaBot = new SecretSantaBot(
        telegram,
        users,
        commandsFactory,
        buttonsFactory
    );

    telegram.on('text', (msg: TelegramBot.Message) => {
        console.log(new Date(), msg);
        secretSantaBot.processTextMessage(msg);
    });

    telegram.on('callback_query', (query: TelegramBot.CallbackQuery) => {
        console.log(new Date(), query);
        secretSantaBot.processCallbackQuery(query);
    });

    telegram.startPolling();
}

main(process.argv);
