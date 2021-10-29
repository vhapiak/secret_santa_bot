import TelegramBot from 'node-telegram-bot-api';
import { ButtonsFactoryImpl } from './buttons/impl/buttonsFactoryImpl';
import { CommandsFactoryImpl } from './commands/impl/commandsFactoryImpl';
import { Context } from './context';
import { EventsManagerImpl } from './event/eventsManagerImpl';
import { OutputManagerImpl } from './output/outputManagerImpl';
import { SecretSantaBot } from './secretSantaBot';
import { UsersManagerImpl } from './user/usersManagerImpl';

async function main(argv: string[]) {
    if (argv.length < 4) {
        console.log('Usage: main.js <telegram-token> <db-directory>');
        return;
    }
    
    const telegram = new TelegramBot(argv[2]);
    const users = new UsersManagerImpl(argv[3]);
    const events = new EventsManagerImpl(argv[3]);
    const output = new OutputManagerImpl(telegram, users);
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

    telegram.on('text', async (msg: TelegramBot.Message) => {
        console.log(new Date(), msg);
        secretSantaBot.processTextMessage(msg);
    });

    telegram.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
        console.log(new Date(), query);
        secretSantaBot.processCallbackQuery(query);
    });

    telegram.startPolling();
}

main(process.argv);
