import TelegramBot from 'node-telegram-bot-api';
import { ButtonsFactoryImpl } from './buttons/impl/buttonsFactoryImpl';
import { CommandsFactoryImpl } from './commands/impl/commandsFactoryImpl';
import { Context } from './context';
import { EventsManagerImpl } from './event/impl/eventsManagerImpl';
import { OutputManagerImpl } from './output/impl/outputManagerImpl';
import { SecretSantaBot } from './secretSantaBot';
import { UsersManagerImpl } from './user/impl/usersManagerImpl';
import { TelegramService } from './service/impl/telegramService';

/**
 * Bot entry point
 */
function main(argv: string[]) {
    if (argv.length < 5) {
        console.log('Usage: main.js <telegram-name> <telegram-token> <db-directory>');
        return;
    }

    const botName = argv[2];
    const botToken = argv[3];
    const dbPath = argv[4];
    
    const telegram = new TelegramBot(botToken);
    const service = new TelegramService(botName, telegram);
    const users = new UsersManagerImpl(dbPath);
    const events = new EventsManagerImpl(dbPath, users);
    const output = new OutputManagerImpl(botName, telegram, users);
    const context: Context = {
        service: service,
        users: users,
        events: events,
        output: output
    };

    const commandsFactory = new CommandsFactoryImpl(context);
    const buttonsFactory = new ButtonsFactoryImpl(context);
    
    const secretSantaBot = new SecretSantaBot(
        context,
        commandsFactory,
        buttonsFactory
    );

    telegram.on('text', async (msg: TelegramBot.Message) => {
        console.log(new Date(), msg);
        await secretSantaBot.processTextMessage(msg);
    });

    telegram.on('callback_query', (query: TelegramBot.CallbackQuery) => {
        console.log(new Date(), query);
        secretSantaBot.processCallbackQuery(query);
    });

    telegram.startPolling();
}

main(process.argv);
