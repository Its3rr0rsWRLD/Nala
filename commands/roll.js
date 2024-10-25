const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Rolls a dice")
    .addIntegerOption((option) =>
      option.setName("sides")
        .setDescription("Number of sides on the dice (default is 6)")
        .setRequired(false)
    ),
  execute: async (interaction) => {
    const sides = interaction.options.getInteger("sides") || 6;
    if (sides <= 1) {
      return interaction.reply({
        content: "The dice must have at least 2 sides.",
        ephemeral: true,
      });
    }
    const result = Math.floor(Math.random() * sides) + 1;
    await interaction.reply(
      `🎲 You rolled a **${result}** on a ${sides}-sided dice!`,
    );
  },
};
