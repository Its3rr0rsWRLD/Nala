const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const settings = require("../settings.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong and latency information"),

  execute: async (interaction, utils, client) => {
    try {
      const latency = Date.now() - interaction.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);

      const pingEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle("Pong!")
        .addFields(
          { name: "Latency", value: `${latency}ms`, inline: true },
          { name: "API Latency", value: `${apiLatency}ms`, inline: true },
        )
        .setTimestamp();

      await utils.tempReply(interaction, {
        embeds: [pingEmbed],
        time: settings.defaultTempReply,
        showTime: true,
      });
    } catch (error) {
      console.error(`Error executing 'ping' command: ${error.message}`);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "An error occurred while executing the command.",
          ephemeral: true,
        });
      }
    }
  },
};
