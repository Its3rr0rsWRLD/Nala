const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require(
  "discord.js",
);
const fs = require("fs");
const path = require("path");

const dbFilePath = path.join(__dirname, "../db.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user from the server")
    .addStringOption((option) =>
      option.setName("user_id")
        .setDescription("The ID of the user to unban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason")
        .setDescription("The reason for the unban")
        .setRequired(false)
    ),

  execute: async (interaction, utils) => {
    const userId = interaction.options.getString("user_id");
    const reason = interaction.options.getString("reason") ||
      "No reason provided";
    const guild = interaction.guild;

    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setDescription("You do not have permission to use this command."),
        ],
        ephemeral: false,
      });
    }

    if (
      !guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setDescription("I do not have permission to unban members."),
        ],
        ephemeral: false,
      });
    }

    try {
      // Remove the user from the ban database if present
      let bansDB = {};
      if (fs.existsSync(dbFilePath)) {
        try {
          bansDB = JSON.parse(fs.readFileSync(dbFilePath, "utf8"));
        } catch (error) {
          console.error(`Failed to read db.json: ${error.message}`);
        }
      }

      if (bansDB[guild.id] && bansDB[guild.id][userId]) {
        delete bansDB[guild.id][userId];
        try {
          fs.writeFileSync(dbFilePath, JSON.stringify(bansDB, null, 2), "utf8");
        } catch (error) {
          console.error(`Failed to write to db.json: ${error.message}`);
        }
      }

      // Check if the user is banned
      const ban = await guild.bans.fetch(userId).catch(() => null);
      if (ban) {
        await guild.members.unban(userId, reason);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x00FF00)
              .setDescription(`Successfully unbanned <@${userId}>.`),
          ],
          ephemeral: false,
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xFFFF00)
              .setDescription(
                "User was not found in the server ban list. No action taken.",
              ),
          ],
          ephemeral: false,
        });
      }

      // Notify the user via DM
      try {
        const user = await interaction.client.users.fetch(userId);
        if (user) {
          const unbanEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`You have been unbanned from ${guild.name}`)
            .setDescription(`You have been unbanned from **${guild.name}**.`)
            .addFields(
              { name: "Reason", value: reason, inline: true },
              { name: "Server", value: guild.name, inline: true },
            )
            .setTimestamp();

          await user.send({ embeds: [unbanEmbed] });
        }
      } catch (error) {
        console.error(
          `Failed to send DM to user ID ${userId}: ${error.message}`,
        );
      }
    } catch (error) {
      console.error(`Failed to unban user ID ${userId}: ${error.message}`);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setDescription(
              "An error occurred while trying to unban the user.",
            ),
        ],
        ephemeral: false,
      });
    }
  },
};
