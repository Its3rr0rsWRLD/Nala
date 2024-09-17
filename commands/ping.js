const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency information'),

    execute: async (interaction) => {
        const latency = Date.now() - interaction.createdTimestamp;
        await interaction.reply({ content: `Pong! Latency: ${latency}ms`, ephemeral: true });
    }
};