const { Client, GatewayIntentBits, Partials } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages], partials: [Partials.USER, Partials.CHANNEL, Partials.GUILD_MEMBER] });

const hardCommands = [
    {
        handler: require('./commands/handler.js'),
        chatbot: require('./commands/chatbot.js'),
    }
];

const fs = require('fs');

const commands = JSON.parse(fs.readFileSync('commands.json', 'utf8'));

client.on('ready', async () => {
    for (const command of commands) {
        console.log(`Registering command ${command.name}...`);
        await client.application.commands.create(command);
    }

    console.log('Global slash commands registered!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    /* run the file in the json under 'path' */
    const command = require(`${commands.find(cmd => cmd.name === commandName).path}`);

    try {
        await command(interaction, client);
    } catch (error) {
        // hardCommands[0].handler.execute(interaction, error);
        console.error(error);
    }
});

client.on('messageCreate', async message => {
    if (message.content.startsWith(`<@${client.user.id}>`)) {
        let msg = message.content.split('<@')[1].split('>')[1]
        console.log(msg);
        if (!msg) return message.channel.send('Yes?');

        return hardCommands[0].chatbot(message, client, msg);
    }
});

client.login(process.env.TOKEN);