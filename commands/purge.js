const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Purge messages or delete and recreate the channel")
    .addIntegerOption((option) =>
      option.setName("messages").setDescription("Number of messages to purge")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName("recreate_channel").setDescription(
        "Delete and recreate the channel",
      ).setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  execute: async (interaction) => {
    const messagesToDelete = interaction.options.getInteger("messages");
    const recreateChannel = interaction.options.getBoolean("recreate_channel");

    if (messagesToDelete) {
      const channel = interaction.channel;

      if (messagesToDelete <= 0 || messagesToDelete > 100) {
        return interaction.reply({
          content: "You can only purge between 1 and 100 messages at a time.",
          ephemeral: true,
        });
      }

      await channel.bulkDelete(messagesToDelete, true);
      await interaction.reply({
        content: `Successfully deleted ${messagesToDelete} messages.`,
        ephemeral: true,
      });
    } else if (recreateChannel) {
      const oldChannel = interaction.channel;

      await interaction.reply({
        content: "Channel will be deleted and recreated.",
        ephemeral: true,
      });
      const newChannel = await oldChannel.clone();
      await oldChannel.delete();
      await newChannel.send("This channel has been recreated.");
    } else {
      await interaction.reply({
        content:
          "Please provide either messages to purge or choose to recreate the channel.",
        ephemeral: true,
      });
    }
  },
};
