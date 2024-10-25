const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears a number of messages from a channel")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (max 100)")
        .setRequired(true)
    ),

  execute: async (interaction) => {
    const amount = interaction.options.getInteger("amount");

    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages,
      )
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "Please enter a number between 1 and 100.",
        ephemeral: true,
      });
    }

    await interaction.channel.bulkDelete(amount, true).catch((error) => {
      console.error(error);
      interaction.reply({
        content: "An error occurred while trying to delete messages.",
        ephemeral: true,
      });
    });

    await interaction.reply({
      content: `Deleted ${amount} messages.`,
      ephemeral: true,
    });
  },
};
