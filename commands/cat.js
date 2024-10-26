const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cat")
    .setDescription("Sends a random cat image"),
  
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const response = await axios.get("https://api.thecatapi.com/v1/images/search");
      const catImageUrl = response.data[0].url;

      const embed = new EmbedBuilder()
        .setColor(0xFFC0CB)
        .setTitle("Here’s a random cat! 🐱")
        .setImage(catImageUrl);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply("An error occurred while fetching a cat image.");
    }
  },
};