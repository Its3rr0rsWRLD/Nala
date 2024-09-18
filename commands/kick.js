const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false)),

    execute: async (interaction, utils) => {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
        }

        if (settings.alertKickToUser) {
            const kickEmbed = {
                color: 0xFF0000,
                title: `Kicked from ${interaction.guild.name}`,
                thumbnail: {
                    url: interaction.guild.iconURL()
                },
                fields: [
                    { name: 'Reason', value: reason, inline: true },
                ],
                timestamp: new Date(),
            };

            try {
                await user.send({ embeds: [kickEmbed] });
            } catch (error) {
                utils.error(`Failed to send DM to ${user.tag}: ${error.message}`);
            }
        }

        try {
            await member.kick(reason);
            await interaction.reply({ content: `Successfully kicked ${user.tag}.`, ephemeral: true });
        } catch (error) {
            utils.error(`Failed to kick ${user.tag}: ${error.message}`);
            await interaction.reply({ content: `Failed to kick ${user.tag}.`, ephemeral: true });
        }
    }
};