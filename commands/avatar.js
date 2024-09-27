const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Displays a user's avatar")
    .addUserOption((option) =>
      option.setName('user').setDescription('Select a user').setRequired(false)
    ),

  execute: async (interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;

    const avatarEmbed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`${user.tag}'s Avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }));

    await interaction.reply({ embeds: [avatarEmbed] });
  },
};