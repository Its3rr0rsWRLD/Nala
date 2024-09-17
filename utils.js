class Utils {
    constructor() {}

    async tempReply(interaction, options) {
        const content = options.content;
        const ephemeral = options.ephemeral || false;
        const time = options.time || 5000;
        const showTime = options.showTime || false;

        try {
            const deleteAt = Math.floor((Date.now() + time) / 1000);

            let replyContent = content;

            if (showTime) {
                replyContent += `\n-# Deleting message <t:${deleteAt}:R>`;
            }

            const reply = await interaction.reply({ content: replyContent, ephemeral: ephemeral, fetchReply: true });

            setTimeout(() => {
                reply.delete().catch(console.error);
            }, time);
        } catch (error) {
            console.error(error);
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
                emoji = 'ℹ️';
                console.log(chalk.hex('#FFFFFF')(emoji + '  ' + message)); // Default to white
                break;
        }
    }

    async error(error) {
        console.error(error);
    }
}

module.exports = Utils;