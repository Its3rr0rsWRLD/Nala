<p align="center">
    <div align="center">
        <img src="images/nala.gif" alt="Nala" href="https://discord.com/oauth2/authorize?client_id=1223073528954490940&scope=bot">
    </div>

# Nala
**Nala** is an open-source Discord bot designed for various random needs. It offers a flexible command structure and integrates seamlessly with Discord's API. This README will guide you through setting up, configuring, and contributing to Nala.

**[Join the Discord!](https://dsc.gg/3rr0r)**

**[Invite Nala to your server!](https://discord.com/oauth2/authorize?client_id=1223073528954490940&scope=bot)**

## Features

- **Slash Commands**: Define and manage commands with ease.
- **Subcommands**: Organize commands with subcommands for better functionality.
- **Utility Functions**: Built-in utilities for logging and temporary replies.
- **Configuration**: Easy-to-manage settings for initialization and command logging.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/nala.git
   cd nala
   ```

2. **Install Dependencies**

   Make sure you have [Node.js](https://nodejs.org/) installed. Then, run:

   ```bash
   npm install
   ```

3. **Create a `.env` File**

   In the root directory, create a `.env` file and add your Discord bot token:

   ```env
   TOKEN=your-discord-bot-token
   ```

4. **Configure Settings**

   Modify `settings.json` to configure bot settings:

   ```json
   {
       "defaultTempReply": 5000,
       "initMessage": {
           "enabled": true,
           "message": "Nala is ready for liftoff! 🚀"
       },
       "logCommandsInit": true
   }
   ```

## Usage

1. **Define Commands**

   Place your command files in the `commands` directory. Each command file should export an object with `data` and `execute` properties.

   Example command (`commands/ping.js`):

   ```javascript
   const { SlashCommandBuilder } = require('discord.js');

   module.exports = {
       data: new SlashCommandBuilder()
           .setName('ping')
           .setDescription('Replies with Pong and latency information'),

       execute: async (interaction) => {
           const latency = Date.now() - interaction.createdTimestamp;
           await interaction.reply({ content: `Pong! Latency: ${latency}ms`, ephemeral: true });
       }
   };
   ```

2. **Start the Bot**

   Run the bot using:

   ```bash
   npm start
   ```

   The bot will log in and start listening for commands.

## Contributing

1. **Fork the Repository**

   Click the "Fork" button at the top right of this page.

2. **Create a New Branch**

   ```bash
   git checkout -b my-new-feature
   ```

3. **Make Your Changes**

   Modify or add features to the bot.

4. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "Add some feature"
   ```

5. **Push to Your Fork**

   ```bash
   git push origin my-new-feature
   ```

6. **Create a Pull Request**

   Go to the original repository and click "New Pull Request". Describe your changes and submit.

## License

Nala is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Support

If you have any issues or questions, feel free to open an issue on GitHub or contact the project maintainers.