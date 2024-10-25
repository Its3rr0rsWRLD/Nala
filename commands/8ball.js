const { SlashCommandBuilder } = require("discord.js");

const responses = [
  "Yes.",
  "No.",
  "Maybe.",
  "It is certain.",
  "Very doubtful.",
  "Ask again later.",
  "Definitely.",
  "I have my doubts.",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Answers a yes/no question")
    .addStringOption((option) =>
      option.setName("question").setDescription("Your question").setRequired(
        true,
      )
    ),

  execute: async (interaction) => {
    const question = interaction.options.getString("question");
    const response = responses[Math.floor(Math.random() * responses.length)];

    await interaction.reply(
      `🎱 **Question:** ${question}\n**Answer:** ${response}`,
    );
  },
};
