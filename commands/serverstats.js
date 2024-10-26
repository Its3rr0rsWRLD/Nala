const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverstats")
    .setDescription("Displays server statistics"),

  execute: async (interaction) => {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`${guild.name} Statistics`)
      .addFields(
        { name: "Total Members", value: `${guild.memberCount}`, inline: true },
        { name: "Total Channels", value: `${guild.channels.cache.size}`, inline: true },
        { name: "Total Roles", value: `${guild.roles.cache.size}`, inline: true },
        { name: "Boost Level", value: `${guild.premiumTier}`, inline: true },
        { name: "Boosts", value: `${guild.premiumSubscriptionCount}`, inline: true },
        { name: "Emoji Count", value: `${guild.emojis.cache.size}`, inline: true }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setTimestamp();

    const downloadButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("download_json")
        .setLabel("Download JSON")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [downloadButton] });

    const filter = (i) => i.customId === "download_json" && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (btnInteraction) => {
      const guildData = {
        name: guild.name,
        id: guild.id,
        channels: guild.channels.cache.map((channel) => ({
          name: channel.name,
          id: channel.id,
          type: channel.type,
        })),
        roles: guild.roles.cache.map((role) => ({
          name: role.name,
          id: role.id,
          color: role.color,
        })),
        members: guild.members.cache.map((member) => ({
          id: member.id,
          nickname: member.nickname || null,
          roles: member.roles.cache.map((role) => role.name),
        })),
      };

      const jsonBuffer = Buffer.from(JSON.stringify(guildData, null, 2));
      const attachment = new AttachmentBuilder(jsonBuffer, { name: "server_data.json" });

      await btnInteraction.reply({ files: [attachment], ephemeral: true });
    });

    collector.on("end", async () => {
      await interaction.editReply({ components: [] });
    });
  },
};