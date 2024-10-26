const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const Utils = require("../utils");
const utils = new Utils();

const settings = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "settings.json"), "utf8")
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transcribe")
    .setDescription("Transcribe an uploaded audio file")
    .addAttachmentOption((option) =>
      option
        .setName("audio")
        .setDescription("The audio file to transcribe (mp3, wav, m4a, etc.)")
        .setRequired(true)
    ),

  execute: async (interaction) => {
    await interaction.deferReply();

    const audioAttachment = interaction.options.getAttachment("audio");
    if (!audioAttachment) {
      return interaction.editReply(
        "Please provide an audio file to transcribe."
      );
    }

    const validExtensions = [".mp3", ".wav", ".m4a", ".ogg", ".webm"];
    const fileExtension = path.extname(audioAttachment.name).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      return interaction.editReply(
        "Unsupported audio format. Please upload a valid audio file (mp3, wav, m4a, ogg, webm)."
      );
    }

    const audioUrl = audioAttachment.url;
    const tempDir = path.join(__dirname, "../temp");
    const audioPath = path.join(tempDir, `${interaction.id}${fileExtension}`);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    let transcriptionPath = "";

    try {
      const response = await axios.get(audioUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(audioPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const transcribeHost = settings.transcribeHost;
      if (!transcribeHost) {
        return interaction.editReply("Transcription host is not configured.");
      }

      const formData = new FormData();
      formData.append("audio", fs.createReadStream(audioPath));

      const transcribeResponse = await axios.post(transcribeHost, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      if (!transcribeResponse.data || !transcribeResponse.data.transcription) {
        return utils.error(
          new Error("Invalid response from the transcription service."),
          interaction
        );
      }

      const transcription = transcribeResponse.data.transcription;
      const MAX_EMBED_LENGTH = 4096;

      // Check if the transcription is too long for an embed
      const embed = new EmbedBuilder().setTitle("Transcription Complete").setColor("#00FF00");

      if (transcription.length <= MAX_EMBED_LENGTH - 20) { // 20 for padding
        embed.setDescription(`\`\`\`\n${transcription}\n\`\`\`\nTo report inaccuracies, please use /bugreport.`);
        await interaction.editReply({ embeds: [embed] });
      } else {
        transcriptionPath = path.join(tempDir, `${interaction.id}.txt`);
        fs.writeFileSync(transcriptionPath, transcription);

        embed.setDescription(
          "The transcription of your audio file is complete.\nThe transcription was too long to display here, so it has been attached as a TXT file.\nTo report inaccuracies, please use /bugreport."
        );

        await interaction.editReply({
          embeds: [embed],
          files: [transcriptionPath],
        });
      }
    } catch (error) {
      await utils.error(error, interaction);
      await interaction.editReply(
        "An error occurred while transcribing the audio file."
      );
    } finally {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      if (fs.existsSync(transcriptionPath)) fs.unlinkSync(transcriptionPath);
    }
  },
};