const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays information about the server'),

  execute: async (interaction) => {
    const { guild } = interaction;

    const serverInfoEmbed = new EmbedBuilder()
      .setColor(0x1ABC9C)
      .setTitle(`${guild.name} Info`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Created On', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
      );

    await interaction.reply({ embeds: [serverInfoEmbed] });
  },
};