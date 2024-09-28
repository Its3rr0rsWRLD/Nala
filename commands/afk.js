const { SlashCommandBuilder, Collection } = require('discord.js');
const afkUsers = new Collection();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Sets your status as AFK')
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for being AFK').setRequired(false)
    ),

  execute: async interaction => {
    const reason = interaction.options.getString('reason') || 'AFK';
    afkUsers.set(interaction.user.id, reason);

    await interaction.reply(`You are now AFK: ${reason}`);
  },

  onMessage: (message) => {
    if (afkUsers.has(message.author.id)) {
      afkUsers.delete(message.author.id);
      message.reply(`Welcome back! I've removed your AFK status.`);
    }

    const mentionedUser = message.mentions.users.first();
    if (mentionedUser && afkUsers.has(mentionedUser.id)) {
      message.reply(`${mentionedUser.username} is currently AFK: ${afkUsers.get(mentionedUser.id)}`);
    }
  },
};