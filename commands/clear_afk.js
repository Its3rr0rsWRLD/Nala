const { SlashCommandBuilder, Collection } = require("discord.js");
const afkUsers = new Collection();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear_afk")
    .setDescription("Clears all AFK statuses"),

  execute: async (interaction) => {
    afkUsers.clear();
    await interaction.reply("All AFK statuses have been cleared.");
  },
};
