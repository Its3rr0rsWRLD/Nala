const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require(
  "discord.js",
);
const fs = require("fs");
const path = require("path");

const settingsPath = path.join(__dirname, "../settings.json");
let settings;

try {
  settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
} catch (error) {
  console.error(`Failed to read settings.json: ${error.message}`);
  settings = {};
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server")
    .addUserOption((option) =>
      option.setName("user")
        .setDescription("The user to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason")
        .setDescription("The reason for the kick")
        .setRequired(false)
    ),

  execute: async (interaction, utils) => {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ||
      "No reason provided";

    // Check if the command issuer has the Kick Members permission
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: false,
      });
    }

    // Check if the bot has the Kick Members permission
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.KickMembers,
      )
    ) {
      return interaction.reply({
        content: "I do not have permission to kick members.",
        ephemeral: false,
      });
    }

    // Fetch the member to kick
    const member = await interaction.guild.members.fetch(user.id).catch(() =>
      null
    );

    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        ephemeral: false,
      });
    }

    // Prevent users from kicking themselves
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot kick yourself.",
        ephemeral: false,
      });
    }

    // Prevent kicking the bot itself
    if (user.id === interaction.client.user.id) {
      return interaction.reply({
        content: "I cannot kick myself.",
        ephemeral: false,
      });
    }

    // Check role hierarchy: User cannot kick members with equal or higher roles
    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "You cannot kick this user because they have a higher or equal role.",
        ephemeral: false,
      });
    }

    // Check role hierarchy: Bot cannot kick members with higher roles than itself
    if (
      member.roles.highest.position >=
        interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "I cannot kick this user because their role is higher than mine.",
        ephemeral: false,
      });
    }

    // Notify the user about the kick via DM if enabled in settings
    if (settings.alertKickToUser) {
      const kickEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`You have been kicked from ${interaction.guild.name}`)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .addFields({ name: "Reason", value: reason })
        .setTimestamp();

      try {
        await user.send({ embeds: [kickEmbed] });
      } catch (error) {
        utils.error(`Failed to send DM to ${user.tag}: ${error.message}`);
      }
    }

    // Attempt to kick the member
    try {
      await member.kick(reason);
      await interaction.reply({
        content: `Successfully kicked ${user.tag}.`,
        ephemeral: false,
      });
    } catch (error) {
      utils.error(`Failed to kick ${user.tag}: ${error.message}`);
      await interaction.reply({
        content: `Failed to kick ${user.tag}.`,
        ephemeral: false,
      });
    }
  },
};
