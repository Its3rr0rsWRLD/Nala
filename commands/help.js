const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of available commands'),

  execute: async (interaction) => {
    const commands = interaction.client.commands;

    const helpEmbed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('Available Commands')
      .setDescription('Here is a list of commands you can use:');

    commands.forEach((command) => {
      helpEmbed.addFields({
        name: `/${command.data.name}`,
        value: command.data.description,
        inline: false,
      });
    });

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};