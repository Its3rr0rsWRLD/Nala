const { SlashCommandBuilder } = require('discord.js');
const afkUsers = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set your AFK status')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('AFK message')
        .setRequired(false)),
  execute: async (interaction) => {
    const message = interaction.options.getString('message') || 'AFK';
    afkUsers.set(interaction.user.id, message);

    await interaction.reply({ content: `You are now AFK: ${message}`, ephemeral: true });
  },
};