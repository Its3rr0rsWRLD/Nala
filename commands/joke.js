const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tells a random joke'),

  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const response = await axios.get('https://official-joke-api.appspot.com/jokes/random');
      const joke = response.data;

      await interaction.editReply(`${joke.setup}\n\n${joke.punchline}`);
    } catch (error) {
      console.error(error);
      await interaction.editReply('Could not fetch a joke at this time.');
    }
  },
};