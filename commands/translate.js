const { SlashCommandBuilder } = require("discord.js");
const { translate } = require("@vitalets/google-translate-api");
const Utils = require("../utils");
const utils = new Utils();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translates text to a specified language")
    .addStringOption((option) =>
      option.setName("text").setDescription("Text to translate").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("language").setDescription(
        "Target language (e.g., en, es)"
      ).setRequired(true)
    ),

  execute: async (interaction) => {
    const text = interaction.options.getString("text");
    const targetLanguage = interaction.options.getString("language");

    try {
      const res = await translate(text, { to: targetLanguage });

      await interaction.reply(
        `**Detected Language:** ${res.from.language.iso.toUpperCase()}\n**Translated Text:**\n${res.text}`
      );
    } catch (error) {
      utils.error(error);
      await interaction.reply("An error occurred while translating the text.");
    }
  },
};