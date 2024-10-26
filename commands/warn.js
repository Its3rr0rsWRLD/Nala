const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require(
  "discord.js",
);
const fs = require("fs");
const path = require("path");

const warnsFilePath = path.join(__dirname, "../warns.json");
const settings = require("../settings.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issues a warning to a user")
    .addUserOption((option) =>
      option.setName("user")
        .setDescription("The user to warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason")
        .setDescription("Reason for the warning")
        .setRequired(false)
    ),
  execute: async (interaction) => {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ||
      "No reason provided";
    const member = interaction.guild.members.cache.get(target.id);

    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: false,
      });
    }

    if (!member) {
      return interaction.reply({ content: "User not found.", ephemeral: false });
    }

    let warns = {};
    if (fs.existsSync(warnsFilePath)) {
      warns = JSON.parse(fs.readFileSync(warnsFilePath, "utf8"));
    }

    const guildId = interaction.guild.id;
    const userId = target.id;

    if (!warns[guildId]) warns[guildId] = {};
    if (!warns[guildId][userId]) warns[guildId][userId] = [];

    warns[guildId][userId].push({
      reason: reason,
      date: new Date().toISOString(),
      moderator: interaction.user.id,
    });

    fs.writeFileSync(warnsFilePath, JSON.stringify(warns, null, 2));

    const warnEmbed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle("User Warned")
      .addFields(
      { name: "User", value: `${target.tag}`, inline: true },
      { name: "Reason", value: reason, inline: false },
      {
        name: "Total Warnings",
        value: `${warns[guildId][userId].length}`,
        inline: true,
      },
      )
      .setTimestamp();

    if (settings.alertUser.warn) {
      try {
        await target.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xFFA500)
              .setTitle("You have been warned")
              .setDescription(
                `You have been warned in ${interaction.guild.name} for: ${reason}`,
              )
              .setTimestamp(),
          ],
        });
      } catch (error) {
        console.error(`Failed to send warning DM to user: ${error}`);
      }
    }

    await interaction.reply({ embeds: [warnEmbed] });
  },
};
