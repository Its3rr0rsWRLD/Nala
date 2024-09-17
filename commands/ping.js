const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const settings = require('../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency information'),

    execute: async (interaction, utils) => {
        const latency = Date.now() - interaction.createdTimestamp;

        const pingEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Pong!')
            .setDescription(`Latency: ${latency}ms`)
            .setTimestamp();

        await utils.tempReply(interaction, { embeds: [pingEmbed], time: settings.defaultTempReply, showTime: true });
    }
};
