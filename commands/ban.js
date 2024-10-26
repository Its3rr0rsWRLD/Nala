const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const ms = require("ms");

const dbPath = path.join(__dirname, "../db.json");
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
    .setName("ban")
    .setDescription("Ban a user from the server with options")
    .addUserOption((option) =>
      option.setName("user")
        .setDescription("The user to ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason")
        .setDescription("The reason for the ban")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("duration")
        .setDescription("Duration of the ban (e.g., 5s, 1m, 2h, 3d, 1mo, 6y)")
        .setRequired(false)
    ),

  execute: async (interaction, utils) => {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ||
      "No reason provided";
    const durationStr = interaction.options.getString("duration");

    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: false,
      });
    }

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.BanMembers,
      )
    ) {
      return interaction.reply({
        content: "I do not have permission to ban members.",
        ephemeral: false,
      });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() =>
      null
    );
    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        ephemeral: false,
      });
    }

    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot ban yourself.",
        ephemeral: false,
      });
    }

    if (user.id === interaction.client.user.id) {
      return interaction.reply({
        content: "I cannot ban myself.",
        ephemeral: false,
      });
    }

    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "You cannot ban this user because they have a higher or equal role.",
        ephemeral: false,
      });
    }

    if (
      member.roles.highest.position >=
        interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "I cannot ban this user because their role is higher than mine.",
        ephemeral: false,
      });
    }

    let duration;
    let unbanTimestamp = null;

    if (durationStr) {
      duration = ms(durationStr);
      if (!duration || duration <= 0) {
        return interaction.reply({
          content: "Invalid duration format.",
          ephemeral: false,
        });
      }
      unbanTimestamp = Date.now() + duration;
    }

    if (settings.alertUser.ban) {
      const banEmbed = {
        color: 0xFF0000,
        title: `You have been banned from ${interaction.guild.name}`,
        thumbnail: {
          url: interaction.guild.iconURL({ dynamic: true }),
        },
        fields: [
          { name: "Reason", value: reason, inline: false },
          {
            name: "Duration",
            value: durationStr || "Permanent",
            inline: false,
          },
        ],
        timestamp: new Date(),
      };

      try {
        await user.send({ embeds: [banEmbed] });
      } catch (error) {
        console.error(`Failed to send DM to ${user.tag}: ${error.message}`);
      }
    }

    try {
      await member.ban({ reason });
      await interaction.reply({
        content: `Successfully banned ${user.tag}${
          durationStr ? ` for ${durationStr}` : ""
        }.`,
        ephemeral: false,
      });
    } catch (error) {
      console.error(`Failed to ban ${user.tag}: ${error.message}`);
      return interaction.reply({
        content: `Failed to ban ${user.tag}.`,
        ephemeral: false,
      });
    }

    if (unbanTimestamp) {
      let db = {};
      if (fs.existsSync(dbPath)) {
        try {
          db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        } catch (error) {
          console.error(`Failed to read db.json: ${error.message}`);
        }
      }

      if (!db[interaction.guild.id]) {
        db[interaction.guild.id] = {};
      }
      db[interaction.guild.id][user.id] = { unbanTimestamp };

      try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      } catch (error) {
        console.error(`Failed to write to db.json: ${error.message}`);
      }
    }
  },
};
