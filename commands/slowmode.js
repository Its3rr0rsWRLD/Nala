const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Sets slowmode in the channel")
    .addIntegerOption((option) =>
      option.setName("seconds").setDescription("Number of seconds for slowmode")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  execute: async (interaction) => {
    const seconds = interaction.options.getInteger("seconds");

    await interaction.channel.setRateLimitPerUser(seconds);
    await interaction.reply(`Slowmode set to **${seconds}** seconds.`);
  },
};
