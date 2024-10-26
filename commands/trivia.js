const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");
const Utils = require("../utils");
const utils = new Utils();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Sends a random trivia question with interactive options"),
  
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const response = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
      const trivia = response.data.results[0];

      const allOptions = [...trivia.incorrect_answers, trivia.correct_answer].sort(() => Math.random() - 0.5);
      const correctIndex = allOptions.indexOf(trivia.correct_answer);

      const embed = new EmbedBuilder()
        .setColor(0x1D2439)
        .setTitle("Trivia Question")
        .setDescription(trivia.question)
        .addFields(
          allOptions.map((option, index) => ({ name: `Option ${index + 1}`, value: option, inline: true }))
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("option_0")
          .setLabel("1")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("option_1")
          .setLabel("2")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("option_2")
          .setLabel("3")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("option_3")
          .setLabel("4")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.editReply({ embeds: [embed], components: [row] });

      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000, max: 1 });

      collector.on("collect", async i => {
        const chosenIndex = parseInt(i.customId.split("_")[1]);

        if (chosenIndex === correctIndex) {
          embed.setColor(0x00FF00)
            .addFields({ name: "Result", value: "✅ Correct! Answer: " + trivia.correct_answer, inline: false });
        } else {
          embed.setColor(0xFF0000)
            .addFields({ name: "Result", value: `❌ Incorrect! The correct answer was: ${trivia.correct_answer}`, inline: false });
        }

        await i.update({ embeds: [embed], components: [] });
      });

      collector.on("end", collected => {
        if (collected.size === 0) {
          embed.setColor(0xFFA500)
            .addFields({ name: "Result", value: "⏰ Time's up! You didn't select an answer.", inline: false });
          interaction.editReply({ embeds: [embed], components: [] });
        }
      });
    } catch (error) {
      await interaction.editReply("An error occurred while fetching trivia.");
      utils.error(error);   
    }
  },
};