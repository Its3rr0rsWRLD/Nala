const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Utils = require("../utils");
const utils = new Utils();

const settings = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "settings.json"), "utf8")
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bugreport")
    .setDescription("Report a bug or issue")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("Enter the command the bug is related to")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Describe the bug or issue")
        .setRequired(true)
    ),

  execute: async (interaction) => {
    if (!settings.bugReport.enabled) {
      return utils.tempReply(interaction, {
        content: "Bug reporting is disabled.",
        ephemeral: false,
      });
    }

    const commandName = interaction.options.getString("command");
    const description = interaction.options.getString("description");

    const webhookURL = dotenv.parse(fs.readFileSync(".env")).bugReport_WEBHOOK;
    if (!webhookURL) {
      return utils.tempReply(interaction, {
        content: "Bug reporting is not properly configured.",
        ephemeral: false,
      });
    }

    try {
      await utils.bugReport(
        new Error(description),
        interaction
      );

      await utils.tempReply(interaction, {
        content: "Thank you! Your bug report has been submitted.",
        ephemeral: false,
      });
    } catch (error) {
      console.error(`Failed to send bug report: ${error.message}`);
      await utils.tempReply(interaction, {
        content: "Failed to submit bug report. Please try again later.",
        ephemeral: false,
      });
    }
  },
};