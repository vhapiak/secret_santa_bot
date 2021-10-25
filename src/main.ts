import TelegramBot from 'node-telegram-bot-api';
import { ButtonsFactoryImpl } from './buttons/impl/buttonsFactoryImpl';
import { CommandsFactoryImpl } from './commands/impl/commandsFactoryImpl';
import { Context } from './context';
import { EventsManagerImpl } from './event/eventsManagerImpl';
import { OutputManagerImpl } from './output/outputManagerImpl';
import { UsersManagerImpl } from './user/usersManagerImpl';

function commandDetector(msg: TelegramBot.Message): string | undefined {
    if (!msg.entities) {
        return undefined;
    }
    for (let entity of msg.entities) {
        if (entity.type == 'bot_command') {
            return msg.text?.substr(entity.offset, entity.length);
        }
    }
    return undefined;
}

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

    telegram.on('text', async (msg: TelegramBot.Message) => {
        console.log(new Date(), msg);
        if (!msg.from) {
            return;
        }

        const commandName = commandDetector(msg);
        const command = commandsFactory.createCommand(commandName);

        let user = await users.getUser(msg.from.id);
        if (!user) {
            user = await users.addUser(msg.from.id, msg.from.first_name);
        }

        await command.process({
            from: user,
            chat: {
                id: msg.chat.id,
                title: msg.chat.title ? msg.chat.title : '<unknow>'
            },
            data: msg.text ? msg.text : ''
        });
    });

    telegram.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
        console.log(new Date(), query);

        if (!query.data || !query.message) {
            console.warn('Empty query data');
            return;
        } 

        const button = buttonsFactory.createButton(query.data);
        if (!button) {
            console.warn('Unknown button');
            return;
        }

        let user = await users.getUser(query.from.id);
        if (!user) {
            user = await users.addUser(query.from.id, query.from.first_name);
        }

        await button.process({
            id: query.id,
            from: user,
            chatId: query.message.chat.id,
            messageId: query.message.message_id
        });
    });

    telegram.startPolling();
}

main(process.argv);
