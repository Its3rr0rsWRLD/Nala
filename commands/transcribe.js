const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const settings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'settings.json'), 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transcribe')
        .setDescription('Transcribe an uploaded audio file')
        .addAttachmentOption(option =>
            option.setName('audio')
                .setDescription('The audio file to transcribe (mp3, wav, m4a, etc.)')
                .setRequired(true)
        ),

    execute: async (interaction) => {
        await interaction.deferReply();

        const audioAttachment = interaction.options.getAttachment('audio');
        if (!audioAttachment) {
            return interaction.editReply('Please provide an audio file to transcribe.');
        }

        const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm'];
        const fileExtension = path.extname(audioAttachment.name).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            return interaction.editReply('Unsupported audio format. Please upload a valid audio file (mp3, wav, m4a, ogg, webm).');
        }

        const audioUrl = audioAttachment.url;
        const tempDir = path.join(__dirname, '../temp');
        const audioPath = path.join(tempDir, `${interaction.id}${fileExtension}`);

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        let transcriptionPath = '';

        try {
            const response = await axios.get(audioUrl, { responseType: 'stream' });
            const writer = fs.createWriteStream(audioPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const transcribeHost = settings.transcribeHost;
            if (!transcribeHost) {
                return interaction.editReply('Transcription host is not configured.');
            }

            const formData = new FormData();
            formData.append('audio', fs.createReadStream(audioPath));

            const transcribeResponse = await axios.post(transcribeHost, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });

            if (!transcribeResponse.data || !transcribeResponse.data.transcription) {
                throw new Error('Invalid response from the transcription service.');
            }

            const transcription = transcribeResponse.data.transcription;
            transcriptionPath = path.join(tempDir, `${interaction.id}.txt`);
            fs.writeFileSync(transcriptionPath, transcription);

            const embed = new EmbedBuilder()
                .setTitle('Transcription Complete')
                .setDescription('The transcription of your audio file is complete. Please find the transcription attached as a TXT file.')
                .setColor('#00FF00');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('report_inaccuracy')
                        .setLabel('Report Inaccuracy')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.editReply({ embeds: [embed], files: [transcriptionPath], components: [row] });
        } catch (error) {
            console.error(`Error during transcription: ${error.message}`);
            await interaction.editReply('An error occurred while transcribing the audio file.');
        } finally {
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            if (fs.existsSync(transcriptionPath)) fs.unlinkSync(transcriptionPath);
        }
    },
};