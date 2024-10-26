const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require(
  "discord.js"
);
const fs = require("fs");
const path = require("path");

const warnsFilePath = path.join(__dirname, "../warns.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Displays warnings for a user or all warnings in the server")
    .addUserOption((option) =>
      option.setName("user")
        .setDescription("The user to check")
        .setRequired(false)
    ),
  
  execute: async (interaction) => {
    const target = interaction.options.getUser("user");

    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: false,
      });
    }

    let warns = {};
    if (fs.existsSync(warnsFilePath)) {
      warns = JSON.parse(fs.readFileSync(warnsFilePath, "utf8"));
    }

    const guildId = interaction.guild.id;

    if (target) {
      const userId = target.id;
      const member = interaction.guild.members.cache.get(userId);

      if (!member) {
        return interaction.reply({ content: "User not found.", ephemeral: false });
      }

      if (!warns[guildId] || !warns[guildId][userId]) {
        return interaction.reply({
          content: "This user has no warnings.",
          ephemeral: false,
        });
      }

      const userWarns = warns[guildId][userId];
      const warnEmbed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle(`Warnings for ${target.tag}`)
        .setDescription(
          userWarns.map((warn, index) =>
            `**${index + 1}.** Reason: ${warn.reason}\nDate: ${
              new Date(warn.date).toLocaleString()
            }\nModerator: <@${warn.moderator}>`
          ).join("\n\n")
        )
        .setTimestamp();

      return interaction.reply({ embeds: [warnEmbed] });
    }

    if (!warns[guildId] || Object.keys(warns[guildId]).length === 0) {
      return interaction.reply({
        content: "There are no warnings in this server.",
        ephemeral: false,
      });
    }

    const allWarnings = [];
    for (const [userId, userWarnings] of Object.entries(warns[guildId])) {
      const user = await interaction.guild.members.fetch(userId).catch(() => null);
      const userTag = user ? user.user.tag : `Unknown User (${userId})`;
      const userWarningsText = userWarnings
        .map((warn, index) =>
          `**${index + 1}.** Reason: ${warn.reason}\nDate: ${
            new Date(warn.date).toLocaleString()
          }\nModerator: <@${warn.moderator}>`
        )
        .join("\n\n");

      allWarnings.push(`**Warnings for ${userTag}:**\n${userWarningsText}`);
    }

    const warnEmbed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle("All Warnings in Server")
      .setDescription(allWarnings.join("\n\n"))
      .setTimestamp();

    await interaction.reply({ embeds: [warnEmbed] });
  },
};