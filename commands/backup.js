const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("backup")
    .setDescription("Create a backup of the server configuration"),

  execute: async (interaction) => {
    const member = interaction.member;

    if (!member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content:
          "You do not have the required permissions to use this command.",
        ephemeral: false,
      });
    }

    const guild = interaction.guild;
    const backupData = {
      name: guild.name,
      id: guild.id,
      channels: guild.channels.cache.map((channel) => ({
        name: channel.name,
        id: channel.id,
        type: channel.type,
      })),
      roles: guild.roles.cache.map((role) => ({
        name: role.name,
        id: role.id,
        color: role.color,
      })),
      members: guild.members.cache.map((member) => ({
        id: member.id,
        nickname: member.nickname || null,
        roles: member.roles.cache.map((role) => role.name),
      })),
    };

    const backupDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `${guild.id}_backup.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    await interaction.reply({
      content: "Server backup created!",
      files: [backupPath],
    });

    fs.unlinkSync(backupPath);
  },
};
