/* Initialization */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const Utils = require('./utils');

const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();

const utils = new Utils();

/* Command Handler */
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);

    if (settings.logCommandsInit) {
        utils.log(`Loaded command: ${command.data.name}`, 'info');
    }
}

/* Event Listener */
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        await utils.tempReply(interaction, { 
            content: '## Woops! How did this happen?\nThere must have been an issue! This command does not exist! 😅', 
            ephemeral: false, 
            time: settings.defaultTempReply,
            showTime: true
        });
        return;
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        utils.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

/* Bot Initialization Message */
if (settings.initMessage.enabled) {
    client.once('ready', () => {
        utils.log(settings.initMessage.message, 'info');
    });
}

/* Log Command Initialization */
if (settings.logCommandsInit) {
    utils.log('Commands have been initialized.', 'info');
}

/* Bot Login */
client.login(process.env.TOKEN);