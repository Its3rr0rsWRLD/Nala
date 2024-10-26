const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fact")
    .setDescription("Sends a random fun fact"),
  
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const response = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
      const fact = response.data;

      const embed = new EmbedBuilder()
        .setTitle("Random Fun Fact")
        .setDescription(fact.text)
        .setColor("#FFC0CB");

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply("An error occurred while fetching a fact.");
    }
  },
};
