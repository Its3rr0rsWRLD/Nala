const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const hardCommands = [
    {
        handler: require('./commands/handler.js'),
    }
];

const fs = require('fs');

client.on('ready', async () => {
    const commands = JSON.parse(fs.readFileSync('commands.json', 'utf8'));

    await client.application.commands.set(commands);

    console.log('Global slash commands registered!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    /* run the file in the json under 'path' */
    const command = require(`${commands.find(cmd => cmd.name === commandName).path}`);

    try {
        await command.execute(interaction);
    } catch (error) {
        hardCommands[0].handler.execute(interaction, error);
    }
});

client.login('YOUR_BOT_TOKEN');