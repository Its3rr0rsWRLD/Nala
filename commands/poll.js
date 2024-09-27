const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Creates a poll')
    .addStringOption((option) =>
      option.setName('question').setDescription('Poll question').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('options').setDescription('Comma-separated list of options').setRequired(false)
    ),

  execute: async (interaction) => {
    const question = interaction.options.getString('question');
    const options = interaction.options.getString('options');

    const pollEmbed = new EmbedBuilder()
      .setColor(0xE67E22)
      .setTitle('📊 Poll')
      .setDescription(`**${question}**`)
      .setFooter({ text: `Poll created by ${interaction.user.tag}` });

    let pollMessage;
    if (options) {
      const optionList = options.split(',').map((opt) => opt.trim());
      if (optionList.length > 10) {
        return interaction.reply({ content: 'You can have a maximum of 10 options.', ephemeral: true });
      }

      let description = '';
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

      optionList.forEach((opt, index) => {
        description += `${emojis[index]} ${opt}\n`;
      });

      pollEmbed.addFields({ name: 'Options', value: description });

      pollMessage = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

      for (let i = 0; i < optionList.length; i++) {
        await pollMessage.react(emojis[i]);
      }
    } else {
      pollMessage = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });
      await pollMessage.react('👍');
      await pollMessage.react('👎');
    }
  },
};