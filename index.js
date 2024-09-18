/* Initialization */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const Utils = require('./utils');
const chatbot = require('./chatbot');

const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'));
const dbPath = path.join(__dirname, 'db.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const utils = new Utils();

/* Command Handler */
client.commands.clear();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);

    if (settings.logCommandsInit) {
        utils.log(`Loaded command: ${command.data.name}`, 'info');
    }
}

client.once('ready', async () => {
    if (!client.user) {
        utils.error('Client user is null.');
        return;
    }

    try {
        if (settings.logCommandsInit) {
            utils.log('Started refreshing application (/) commands.', 'info');
        }

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        if (settings.logCommandsInit) {
            utils.log('Successfully reloaded application (/) commands.', 'info');
        }
    } catch (error) {
        utils.error(error);
    }

    if (settings.initMessage.enabled) {
        utils.log(settings.initMessage.message, 'info');
    }

    /* Ban Check Interval */
    setInterval(async () => {
        if (fs.existsSync(dbPath)) {
            const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

            for (const guildId in db) {
                const guild = client.guilds.cache.get(guildId);
                if (!guild) continue;

                for (const userId in db[guildId]) {
                    const banInfo = db[guildId][userId];
                    if (banInfo.unbanTimestamp && Date.now() > banInfo.unbanTimestamp) {
                        try {
                            await guild.members.unban(userId);
                            utils.log(`Unbanned user ${userId} from guild ${guildId}`, 'success');
                            delete db[guildId][userId];
                            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
                        } catch (error) {
                            utils.error(`Failed to unban user ${userId} from guild ${guildId}: ${error.message}`);
                        }
                    }
                }
            }
        }
    }, settings.banCheckTime * 1000);
});

/* Chatbot Listener */
client.on('messageCreate', async message => {
    if (!settings.chatbot.enabled || message.author.bot) return;
    if (settings.chatbot.triggers.some(trigger => {
        const loweredMessage = message.content.toLowerCase();
        const loweredTrigger = trigger.toLowerCase();
        const triggerIndex = loweredMessage.indexOf(loweredTrigger);

        return (
            triggerIndex !== -1 && 
            triggerIndex <= settings.chatbot.offset
        );
    })) {
        try {
            await chatbot(message, utils);
        } catch (error) {
            utils.error(error);
        }
    }
});

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

    if (interaction.options.getSubcommand(false)) {
        const subcommand = command.subcommands.get(interaction.options.getSubcommand());
        if (!subcommand) {
            await utils.tempReply(interaction, { 
                content: '## Woops! How did this happen?\nThere must have been an issue! This subcommand does not exist! 😅', 
                ephemeral: false, 
                time: settings.defaultTempReply,
                showTime: true
            });
            return;
        }

        try {
            await subcommand.execute(interaction, utils, client);
        } catch (error) {
            utils.error(error);
            try {
                await interaction.reply({ content: 'There was an error executing this subcommand!', ephemeral: true });
            } catch (error) {
                utils.error(error);
            }
        }
    } else {
        try {
            await command.execute(interaction, utils, client);
        } catch (error) {
            utils.error(error);
            try {
                await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
            } catch (error) {
                utils.error(error);
            }
        }
    }
});

/* Log Command Initialization */
if (settings.logCommandsInit) {
    utils.log('Commands have been initialized.', 'info');
}

/* noToken */
if (process.argv.includes('noToken')) {
    utils.log('noToken flag detected. Exiting...', 'info');
    setTimeout(() => {
        process.exit(0);
    }, 1000);
} else {
    client.login(process.env.TOKEN);
}