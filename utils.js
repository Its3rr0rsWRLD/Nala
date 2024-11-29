const fs = require("fs");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");

dotenv.config();

let settings;
try {
  settings = JSON.parse(fs.readFileSync(path.join(__dirname, "settings.json"), "utf8"));
} catch (error) {
  console.error("Failed to load settings:", error);
  settings = { bugReport: { automatic: false } }; // Default if settings fail to load
}

class Utils {
  constructor() {}

  getSetting() {
    const mergeSettings = (obj, prefix = "") => {
      const result = {};
      for (const key in obj) {
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          result[key] = mergeSettings(obj[key], `${prefix}${key}_`);
        } else {
          const envKey = `${prefix}${key}`.toUpperCase();
          const envValue = process.env[envKey];
          if (settings.envOverride && envValue !== undefined) {
            if (envValue === "true") result[key] = true;
            else if (envValue === "false") result[key] = false;
            else if (!isNaN(envValue)) result[key] = parseFloat(envValue);
            else result[key] = envValue;
          } else {
            result[key] = obj[key];
          }
        }
      }
      return result;
    };
    return mergeSettings(settings);
}

  async tempReply(interaction, options) {
    let content = options.content;
    const embeds = options.embeds || [];
    const ephemeral = options.ephemeral || false;
    let time = options.time || 5000;
    const showTime = options.showTime || false;

    if (time === 1) {
      time = settings.defaultTempReply || 5000;
    }

    try {
      if (time > 0) {
        const deleteAt = Math.floor((Date.now() + time) / 1000);

        if (showTime && embeds.length > 0) {
          const embed = embeds[0];
          const currentDescription = embed.data.description || "";
          const updatedDescription = `${currentDescription}\n-# Deleting message <t:${deleteAt}:R>`;
          embed.setDescription(updatedDescription);
        } else if (showTime) {
          content += `\n-# Deleting message <t:${deleteAt}:R>`;
        }

        const replyOptions = {
          content: content,
          embeds: embeds,
          ephemeral: ephemeral,
          fetchReply: true,
        };

        const reply = await interaction.reply(replyOptions);

        setTimeout(() => {
          reply.delete().catch((error) => {
            this.error(`Failed to delete message (ID: ${reply.id})`);
          });
        }, time);
      } else {
        const replyOptions = {
          content: content,
          embeds: embeds,
          ephemeral: ephemeral,
        };

        await interaction.reply(replyOptions);
      }
    } catch (error) {
      this.error(error);
    }
  }

  async log(message, color) {
    const { default: chalk } = await import("chalk");

    let emoji = "";
    switch (color) {
      case "success":
        emoji = "✅";
        console.log(chalk.hex("#00FF00")(emoji + "  " + message));
        break;
      case "error":
        emoji = "❌";
        console.log(chalk.hex("#FF0000")(emoji + "  " + message));
        break;
      case "warning":
        emoji = "⚠️";
        console.log(chalk.hex("#FFFF00")(emoji + "  " + message));
        break;
      case "info":
        emoji = "✔️";
        console.log(chalk.hex("#9B59B6")(emoji + "  " + message));
        break;
      case "red":
        emoji = "🔴";
        console.log(chalk.hex("#FF0000")(emoji + "  " + message));
        break;
      case "green":
        emoji = "🟢";
        console.log(chalk.hex("#00FF00")(emoji + "  " + message));
        break;
      case "yellow":
        emoji = "🟡";
        console.log(chalk.hex("#FFFF00")(emoji + "  " + message));
        break;
      case "blue":
        emoji = "🔵";
        console.log(chalk.hex("#0000FF")(emoji + "  " + message));
        break;
      case "purple":
        emoji = "🟣";
        console.log(chalk.hex("#9B59B6")(emoji + "  " + message));
        break;
      default:
        emoji = "ⓘ";
        console.log(chalk.hex("#FFFFFF")(emoji + "  " + message));
        break;
    }
  }

  async debug(message, color) {
    if (settings.debug === "true") {
      if (!color) { color = "info"; }
      this.log(message, color);
    }
  }

  async bugReport(error, interaction) {
    const webhookURL = settings.bugReport.webhookURL;
    if (!webhookURL) {
      if (interaction) {
        return interaction.reply({
          content: "Bug reporting is not properly configured.",
          ephemeral: false,
        });
      }
    }

    const embed = {
      title: "New Bug Report",
      fields: [
        { name: "User", value: `${interaction?.user?.tag || "Internal"} (${interaction?.user?.id || "Unknown ID"})`, inline: false },
        { name: "Command", value: interaction?.commandName || "N/A", inline: false },
        { name: "Description", value: error.toString(), inline: false },
        {
          name: "Server",
          value: `${interaction?.guild?.name || "Unknown Server"} (${interaction?.guild?.id || "Unknown ID"})`,
          inline: false,
        },
      ],
      timestamp: new Date(),
      color: 0xFF0000,
    };

    try {
      await axios.post(webhookURL, {
        content: null,
        embeds: [embed],
      });
    } catch (err) {
      this.log(`Failed to send bug report: ${err}`, "error");
    }
  }

  async error(error, interaction) {
    const firstLine = error.toString().split("\n")[0];
    this.log(firstLine, "error");
    if (settings.bugReport && settings.bugReport.automatic) {
      await this.bugReport(error, interaction);
    }
  }

  async generateXAIResponse(messageContent) {
    try {
      const response = await axios.post("https://api.x.ai/v1/chat/completions", {
        messages: [
          {
            role: "system",
            content: "You are an assistant named Nala, and you are a Discord Bot."
          },
          {
            role: "user",
            content: messageContent
          }
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.XAI_API_KEY}`
        }
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      this.log(`Failed to generate XAI response: ${error}`, "error");
      return "Sorry, I'm having trouble responding right now.";
    }
  }
}

module.exports = Utils;