const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

const dbPath = path.join(__dirname, '../db.json');
const settingsPath = path.join(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server with options')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the ban (e.g., 5s, 1m, 2h, 3d, 1mn, 6y)')
                .setRequired(false)),

    execute: async (interaction, utils) => {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const durationStr = interaction.options.getString('duration') || '0';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
        }

        let duration = ms(durationStr);
        if (!duration) {
            return interaction.reply({ content: 'Invalid duration format.', ephemeral: true });
        }

        const unbanTimestamp = duration > 0 ? Date.now() + duration : null;

        if (settings.alertBanToUser && duration > 0) {
            const banEmbed = {
                color: 0xFF0000,
                title: `Banned from ${interaction.guild.name}`,
                thumbnail: {
                    url: interaction.guild.iconURL()
                },
                fields: [
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Duration', value: durationStr, inline: true },
                    { name: 'Unban', value: `You will be unbanned automatically after the duration ends.`, inline: false },
                ],
                timestamp: new Date(),
            };
        
            try {
                await user.send({ embeds: [banEmbed] });
            } catch (error) {
                console.error(`Failed to send DM to ${user.tag}: ${error.message}`);
            }
        }

        try {
            await member.ban({ reason: reason });
            await interaction.reply({ content: `Successfully banned ${user.tag} for ${durationStr}.`, ephemeral: true });

            let db = {};
            if (fs.existsSync(dbPath)) {
                db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }

            if (!db[interaction.guild.id]) {
                db[interaction.guild.id] = {};
            }
            db[interaction.guild.id][user.id] = { unbanTimestamp };

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        } catch (error) {
            console.error(`Failed to ban ${user.tag}: ${error.message}`);
            await interaction.reply({ content: `Failed to ban ${user.tag}.`, ephemeral: true });
        }
    }
};