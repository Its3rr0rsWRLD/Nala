const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Sends a random meme'),

  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const response = await axios.get('https://www.reddit.com/r/memes/random/.json');
      const [list] = response.data;
      const [post] = list.data.children;

      const memeEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(post.data.title)
        .setImage(post.data.url)
        .setFooter({ text: `👍 ${post.data.ups} | 💬 ${post.data.num_comments}` });

      await interaction.editReply({ embeds: [memeEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Could not fetch a meme at this time.');
    }
  },
};