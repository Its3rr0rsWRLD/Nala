module.exports = {
    execute: async (interaction) => {
        const latency = Date.now() - interaction.createdTimestamp;
        await interaction.reply({ content: `Pong! Latency: ${latency}ms`, ephemeral: true });
    }
};