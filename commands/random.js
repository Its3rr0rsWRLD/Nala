const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Generates a random number between two values')
    .addIntegerOption(option =>
      option.setName('min')
        .setDescription('Minimum value')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('max')
        .setDescription('Maximum value')
        .setRequired(true)),
  execute: async (interaction) => {
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');

    if (min >= max) {
      return interaction.reply({ content: 'Minimum value must be less than maximum value.', ephemeral: true });
    }

    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    await interaction.reply(`🔢 Your random number is: **${result}**`);
  },
};