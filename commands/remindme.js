const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Sets a reminder')
    .addStringOption((option) =>
      option.setName('time').setDescription('Time until reminder (e.g., 10m, 2h)').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('message').setDescription('Reminder message').setRequired(true)
    ),

  execute: async (interaction) => {
    const time = interaction.options.getString('time');
    const reminderMessage = interaction.options.getString('message');
    const delay = ms(time);

    if (!delay || delay < 1000 || delay > 31_536_000_000) {
      return interaction.reply({ content: 'Please specify a valid time between 1s and 1 year.', ephemeral: true });
    }

    await interaction.reply({ content: `Okay! I'll remind you in ${time}.`, ephemeral: true });

    setTimeout(() => {
      interaction.user.send(`⏰ Reminder: ${reminderMessage}`).catch(() => {
        interaction.followUp({ content: `I couldn't send you a DM. Please make sure your DMs are enabled.`, ephemeral: true });
      });
    }, delay);
  },
};