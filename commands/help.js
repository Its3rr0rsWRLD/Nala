const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Utils = require("../utils");
const utils = new Utils();
const settings = utils.getSetting();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays a list of available commands"),

  execute: async (interaction) => {
    const commands = interaction.client.commands;
    const MAX_FIELDS = Math.min(settings.help.max_fields, 25);
    const pages = [];

    let currentEmbed = new EmbedBuilder()
      .setColor("#00AE86")
      .setTitle("Available Commands")
      .setDescription("Here is a list of commands you can use:");

    let fieldCount = 0;

    commands.forEach((command) => {
      if (fieldCount === MAX_FIELDS) {
        currentEmbed.setFooter({ text: `Page ${pages.length + 1} of ${Math.ceil(commands.size / MAX_FIELDS)}` });
        pages.push(currentEmbed);
        currentEmbed = new EmbedBuilder()
          .setColor("#00AE86")
          .setTitle("Available Commands")
          .setDescription("Continued:");
        fieldCount = 0;
      }

      currentEmbed.addFields({
        name: `/${command.data.name}`,
        value: command.data.description || "No description available",
        inline: false,
      });
      fieldCount++;
    });

    currentEmbed.setFooter({ text: `Page ${pages.length + 1} of ${Math.ceil(commands.size / MAX_FIELDS)}` });
    pages.push(currentEmbed);

    let currentPage = 0;

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pages.length <= 1)
    );

    const message = await interaction.reply({
      embeds: [pages[currentPage]],
      components: [buttons],
      ephemeral: false,
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (btnInteraction) => {
      if (btnInteraction.customId === "prev") currentPage--;
      if (btnInteraction.customId === "next") currentPage++;

      pages[currentPage].setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` });

      const updatedButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("⬅️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("➡️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === pages.length - 1)
      );

      await btnInteraction.update({
        embeds: [pages[currentPage]],
        components: [updatedButtons],
      });
    });

    collector.on("end", async () => {
      await message.edit({
        components: [],
      });
    });
  },
};