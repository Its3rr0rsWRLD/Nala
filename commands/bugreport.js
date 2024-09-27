// commands/bugreport.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const settings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'settings.json'), 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bugreport')
        .setDescription('Report a bug or issue')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Enter the command the bug is related to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Describe the bug or issue')
                .setRequired(true)
        ),

    execute: async (interaction) => {
        if (!settings.bugreport.enabled) {
            return interaction.reply({ content: 'Bug reporting is disabled.', ephemeral: true });
        }

        const commandName = interaction.options.getString('command');
        const description = interaction.options.getString('description');
        const user = interaction.user;

        const webhookURL = settings.bugreport.webhook;
        if (!webhookURL) {
            return interaction.reply({ content: 'Bug reporting is not properly configured.', ephemeral: true });
        }

        const embed = {
            title: 'New Bug Report',
            fields: [
                { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
                { name: 'Command', value: commandName, inline: false },
                { name: 'Description', value: description, inline: false },
                { name: 'Server', value: `${interaction.guild.name} (${interaction.guild.id})`, inline: false },
            ],
            timestamp: new Date(),
            color: 0xFF0000,
        };

        try {
            await axios.post(webhookURL, {
                content: null,
                embeds: [embed],
            });

            await interaction.reply({ content: 'Thank you! Your bug report has been submitted.', ephemeral: true });
        } catch (error) {
            console.error(`Failed to send bug report: ${error.message}`);
            await interaction.reply({ content: 'Failed to submit bug report. Please try again later.', ephemeral: true });
        }
    },
};
