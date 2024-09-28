const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Set a reminder with a custom duration')
    .addStringOption(option =>
      option.setName('message').setDescription('The reminder message').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('minutes').setDescription('Time in minutes').setRequired(true)
    ),

  execute: async interaction => {
    const message = interaction.options.getString('message');
    const minutes = interaction.options.getInteger('minutes');

    await interaction.reply(`Reminder set for **${minutes}** minutes.`);

    setTimeout(() => {
      interaction.followUp(`⏰ Reminder: ${message}`);
    }, minutes * 60000);
  },
};
