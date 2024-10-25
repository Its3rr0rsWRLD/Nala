const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require(
  "discord.js",
);
const fs = require("fs");
const path = require("path");

const warnsFilePath = path.join(__dirname, "../warns.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Displays warnings for a user")
    .addUserOption((option) =>
      option.setName("user")
        .setDescription("The user to check")
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const target = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(target.id);

    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    if (!member) {
      return interaction.reply({ content: "User not found.", ephemeral: true });
    }

    let warns = {};
    if (fs.existsSync(warnsFilePath)) {
      warns = JSON.parse(fs.readFileSync(warnsFilePath, "utf8"));
    }

    const guildId = interaction.guild.id;
    const userId = target.id;

    if (!warns[guildId] || !warns[guildId][userId]) {
      return interaction.reply({
        content: "This user has no warnings.",
        ephemeral: true,
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
        ).join("\n\n"),
      )
      .setTimestamp();

    await interaction.reply({ embeds: [warnEmbed] });
  },
};
