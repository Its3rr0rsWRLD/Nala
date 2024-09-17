const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, '../db.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server')
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('The ID of the user to unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the unban')
                .setRequired(false)),

    execute: async (interaction, utils) => {
        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guildId = interaction.guild.id;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription('You do not have permission to use this command.')
                ], ephemeral: true 
            });
        }

        try {
            let bansDB = {};
            if (fs.existsSync(dbFilePath)) {
                bansDB = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
            }

            if (bansDB[guildId] && bansDB[guildId][userId]) {
                delete bansDB[guildId][userId];
                fs.writeFileSync(dbFilePath, JSON.stringify(bansDB, null, 2), 'utf8');
            }

            const bans = await interaction.guild.bans.fetch();
            const ban = bans.get(userId);

            if (ban) {
                await interaction.guild.members.unban(userId, reason);

                await interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setDescription(`Successfully unbanned <@${userId}>.`)
                    ], ephemeral: true
                });
            } else {
                await interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xFFFF00)
                        .setDescription('User was not found in the server ban list. No action taken.')
                    ], ephemeral: true
                });
            }

            const user = await interaction.client.users.fetch(userId);
            if (user) {
                const unbanEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle(`Unbanned from ${interaction.guild.name}`)
                    .setDescription(`You have been unbanned from **${interaction.guild.name}**.`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Server', value: interaction.guild.name, inline: true }
                    )
                    .setTimestamp();

                try {
                    await user.send({ embeds: [unbanEmbed] });
                } catch (error) {
                    console.error(`Failed to send DM to ${user.tag}: ${error.message}`);
                }
            }

        } catch (error) {
            console.error(`Failed to unban user: ${error.message}`);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription('Failed to unban the user.')
                ], ephemeral: true
            });
        }
    }
};