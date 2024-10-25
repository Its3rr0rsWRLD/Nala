const { SlashCommandBuilder } = require("discord.js");
const translate = require("@vitalets/google-translate-api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translates text to a specified language")
    .addStringOption((option) =>
      option.setName("text").setDescription("Text to translate").setRequired(
        true,
      )
    )
    .addStringOption((option) =>
      option.setName("language").setDescription(
        "Target language (e.g., en, es)",
      ).setRequired(true)
    ),

  execute: async (interaction) => {
    const text = interaction.options.getString("text");
    const language = interaction.options.getString("language");

    try {
      const res = await translate(text, { to: language });

      await interaction.reply(`**Translated Text:**\n${res.text}`);
    } catch (error) {
      console.error(error);
      await interaction.reply("An error occurred while translating the text.");
    }
  },
};
