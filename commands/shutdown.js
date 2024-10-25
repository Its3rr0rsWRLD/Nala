const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shutdown")
    .setDescription("Shuts down the bot (owner only)"),

  execute: async (interaction) => {
    const ownerId = "814307718113263656"; // Replace with your Discord user ID

    // Check if the user is the bot owner
    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    // Confirm shutdown
    await interaction.reply({
      content: "Shutting down the bot...",
      ephemeral: true,
    });

    console.log("Bot is shutting down via the shutdown command.");

    // Gracefully close the client
    await interaction.client.destroy();

    // Exit the process
    process.exit(0);
  },
};
