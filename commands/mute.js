const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require(
  "discord.js",
);
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes a user for a specified duration")
    .addUserOption((option) =>
      option.setName("user")
        .setDescription("The user to mute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("duration")
        .setDescription("Duration of mute (e.g., 10m, 1h)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason")
        .setDescription("Reason for muting")
        .setRequired(false)
    ),
  execute: async (interaction) => {
    const target = interaction.options.getUser("user");
    const duration = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason") ||
      "No reason provided";
    const member = interaction.guild.members.cache.get(target.id);

    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers,
      )
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: false,
      });
    }

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.ModerateMembers,
      )
    ) {
      return interaction.reply({
        content: "I do not have permission to mute members.",
        ephemeral: false,
      });
    }

    if (!member) {
      return interaction.reply({ content: "User not found.", ephemeral: false });
    }

    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content: "You cannot mute this user.",
        ephemeral: false,
      });
    }

    const time = ms(duration);
    if (!time || time > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({
        content: "Please specify a valid duration (maximum 28 days).",
        ephemeral: false,
      });
    }

    try {
      await member.timeout(time, reason);
      const muteEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("User Muted")
        .addFields(
          { name: "User", value: `${target.tag}`, inline: true },
          { name: "Duration", value: duration, inline: true },
          { name: "Reason", value: reason, inline: false },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [muteEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while trying to mute the user.",
        ephemeral: false,
      });
    }
  },
};
