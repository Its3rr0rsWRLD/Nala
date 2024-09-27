const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Displays server statistics'),
  execute: async (interaction) => {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`${guild.name} Statistics`)
      .addFields(
        { name: 'Total Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Total Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Total Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount}`, inline: true },
        { name: 'Emoji Count', value: `${guild.emojis.cache.size}`, inline: true }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};