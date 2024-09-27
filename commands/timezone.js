const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timezone')
    .setDescription('Converts time between timezones')
    .addStringOption((option) =>
      option.setName('time').setDescription('Time to convert (HH:MM format)').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('from').setDescription('Source timezone').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('to').setDescription('Target timezone').setRequired(true)
    ),

  execute: async (interaction) => {
    const time = interaction.options.getString('time');
    const from = interaction.options.getString('from');
    const to = interaction.options.getString('to');

    if (!moment.tz.zone(from) || !moment.tz.zone(to)) {
      return interaction.reply('Please provide valid timezones.');
    }

    const timeFormat = 'HH:mm';
    const date = moment.tz(time, timeFormat, from);

    if (!date.isValid()) {
      return interaction.reply('Please provide a valid time.');
    }

    const convertedTime = date.clone().tz(to).format(timeFormat);

    await interaction.reply(`**${time}** in ${from} is **${convertedTime}** in ${to}.`);
  },
};