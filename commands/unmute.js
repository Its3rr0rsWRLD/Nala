const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmutes a muted user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to unmute')
        .setRequired(true)),
  execute: async (interaction) => {
    const target = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(target.id);

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: 'I do not have permission to unmute members.', ephemeral: true });
    }

    if (!member) {
      return interaction.reply({ content: 'User not found.', ephemeral: true });
    }

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({ content: 'This user is not muted.', ephemeral: true });
    }

    try {
      await member.timeout(null);
      const unmuteEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('User Unmuted')
        .addFields(
          { name: 'User', value: `${target.tag}`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [unmuteEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'An error occurred while trying to unmute the user.', ephemeral: true });
    }
  },
};