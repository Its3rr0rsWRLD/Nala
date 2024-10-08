class Utils {
    constructor() {}

    async tempReply(interaction, options) {
        let content = options.content;
        const embeds = options.embeds || [];
        const ephemeral = options.ephemeral || false;
        let time = options.time || 5000;
        const showTime = options.showTime || false;

        if (time === 1) {
            const settings = await import('./settings.json', { assert: { type: 'json' } });
            time = settings.defaultTempReply || 5000;
        }

        try {
            if (time > 0) {
                const deleteAt = Math.floor((Date.now() + time) / 1000);

                if (showTime && embeds.length > 0) {
                    const embed = embeds[0];
                    const currentDescription = embed.data.description || '';
                    const updatedDescription = `${currentDescription}\n-# Deleting message <t:${deleteAt}:R>`;
                    embed.setDescription(updatedDescription);
                } else if (showTime) {
                    content += `\n-# Deleting message <t:${deleteAt}:R>`;
                }

                const replyOptions = {
                    content: content,
                    embeds: embeds,
                    ephemeral: ephemeral,
                    fetchReply: true
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
                    ephemeral: ephemeral
                };

                await interaction.reply(replyOptions);
            }
        } catch (error) {
            this.error(error);
        }
    }

    async log(message, color) {
        const { default: chalk } = await import('chalk');

        let emoji = '';
        switch (color) {
            case 'success':
                emoji = '✅';
                console.log(chalk.hex('#00FF00')(emoji + '  ' + message)); // Green
                break;
            case 'error':
                emoji = '❌';
                console.log(chalk.hex('#FF0000')(emoji + '  ' + message)); // Red
                break;
            case 'warning':
                emoji = '⚠️';
                console.log(chalk.hex('#FFFF00')(emoji + '  ' + message)); // Yellow
                break;
            case 'info':
                emoji = '✔️';
                console.log(chalk.hex('#9B59B6')(emoji + '  ' + message)); // Purple
                break;
            case 'red':
                emoji = '🔴';
                console.log(chalk.hex('#FF0000')(emoji + '  ' + message)); // Red
                break;
            case 'green':
                emoji = '🟢';
                console.log(chalk.hex('#00FF00')(emoji + '  ' + message)); // Green
                break;
            case 'yellow':
                emoji = '🟡';
                console.log(chalk.hex('#FFFF00')(emoji + '  ' + message)); // Yellow
                break;
            case 'blue':
                emoji = '🔵';
                console.log(chalk.hex('#0000FF')(emoji + '  ' + message)); // Blue
                break;
            case 'purple':
                emoji = '🟣';
                console.log(chalk.hex('#9B59B6')(emoji + '  ' + message)); // Purple
                break;
            default:
                emoji = 'ⓘ';
                console.log(chalk.hex('#FFFFFF')(emoji + '  ' + message)); // Default to white
                break;
        }
    }

    async error(error) {
        const firstLine = error.toString().split('\n')[0];
        this.log(firstLine, 'error');
    }
}

module.exports = Utils;