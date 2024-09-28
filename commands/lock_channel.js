const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock_channel')
    .setDescription('Locks the current channel for members')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  execute: async interaction => {
    const channel = interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false,
    });

    await interaction.reply(`🔒 ${channel.name} is now locked.`);
  },
};