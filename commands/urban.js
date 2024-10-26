const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("urban")
    .setDescription("Searches Urban Dictionary for a term")
    .addStringOption((option) =>
      option.setName("term").setDescription("Term to search for").setRequired(true)
    ),

  execute: async (interaction) => {
    const term = interaction.options.getString("term");
    await interaction.deferReply();

    try {
      const response = await axios.get(
        `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`
      );
      const definitions = response.data.list;

      if (definitions.length === 0) {
        return interaction.editReply(`No definitions found for **${term}**.`);
      }

      const [definition] = definitions;

      const formattedDefinition = definition.definition.replace(/\[(.*?)\]/g, "**$1**");
      const formattedExample = definition.example.replace(/\[(.*?)\]/g, "**$1**");

      const urbanEmbed = new EmbedBuilder()
        .setColor(0x1D2439)
        .setTitle(definition.word)
        .setURL(definition.permalink)
        .addFields(
          { name: "Definition", value: formattedDefinition.slice(0, 1024) },
          { name: "Example", value: formattedExample.slice(0, 1024) }
        )
        .setFooter({
          text: `👍 ${definition.thumbs_up} | 👎 ${definition.thumbs_down}`,
        });

      await interaction.editReply({ embeds: [urbanEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "An error occurred while fetching the definition."
      );
    }
  },
};