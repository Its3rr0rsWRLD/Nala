const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Displays information about a user")
    .addUserOption((option) =>
      option.setName("target").setDescription("Select a user").setRequired(true)
    ),

  execute: async (interaction) => {
    const user = interaction.options.getUser("target");
    const member = await interaction.guild.members.fetch(user.id);

    const userInfoEmbed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle(`${user.tag}'s Info`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User ID", value: user.id, inline: true },
        { name: "Nickname", value: member.nickname || "None", inline: true },
        {
          name: "Joined Server",
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
          inline: false,
        },
        {
          name: "Account Created",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
          inline: false,
        },
      );

    await interaction.reply({ embeds: [userInfoEmbed] });
  },
};
