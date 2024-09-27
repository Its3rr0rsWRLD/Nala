<p align="center">
  <a href="https://discord.com/oauth2/authorize?client_id=1223073528954490940&scope=bot">
    <img src="images/nala.gif" alt="Nala" />
  </a>
</p>

# Nala

**Nala** is an open-source Discord bot designed to meet various needs with a flexible command structure and seamless integration with Discord's API.

[![Join Our Discord](https://img.shields.io/badge/Discord-Join%20Us-7289DA?logo=discord&logoColor=white)](https://dsc.gg/3rr0r)
[![Invite Nala](https://img.shields.io/badge/Invite%20Nala-Click%20Here-blue?logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1223073528954490940&scope=bot)

## Features

- **Slash Commands**: Easily define and manage commands.
- **Subcommands**: Organize commands for better functionality.
- **Utility Functions**: Built-in utilities for logging and temporary replies.
- **Customizable Configuration**: Manage settings for initialization and command logging.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Starting the Bot](#starting-the-bot)
  - [Defining Commands](#defining-commands)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Its3rr0rsWRLD/nala.git
   cd nala
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add your Discord bot token:

   ```env
   TOKEN=your_discord_bot_token_here
   ```

4. **Configure Settings**

   Edit `settings.json` to customize the bot's settings:

   ```json
   {
     "defaultTempReply": 5000,
     "initMessage": {
       "enabled": true,
       "message": "Nala is ready for liftoff! 🚀"
     },
     "logCommandsInit": true,
     "alertBanToUser": true,
     "alertKickToUser": true,
     "banCheckTime": 60,
     "invalidCommand": {
       "message": "Invalid command.",
       "timeout": 5000
     }
   }
   ```

## Usage

### Starting the Bot

Run the bot using:

```bash
npm start
```

The bot will log in and start listening for commands.

### Defining Commands

Place your command files in the `commands` directory. Each command file should export an object with `data` and `execute` properties.

#### Example Command: `commands/ping.js`

```javascript
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const settings = require('../settings.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and latency information'),
  
  execute: async (interaction, utils, client) => {
    try {
      const latency = Date.now() - interaction.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);

      const pingEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Pong!')
        .addFields(
          { name: 'Latency', value: `${latency}ms`, inline: true },
          { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
        )
        .setTimestamp();

      await utils.tempReply(interaction, {
        embeds: [pingEmbed],
        time: settings.defaultTempReply,
        showTime: true,
      });
    } catch (error) {
      console.error(`Error executing 'ping' command: ${error.message}`);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'An error occurred while executing the command.',
          ephemeral: true,
        });
      }
    }
  },
};
```

### Available Commands

- `/ping`: Replies with "Pong!" and displays latency information.
- `/ban`: Bans a user with optional duration and reason.
- `/unban`: Unbans a user by their ID.
- `/kick`: Kicks a user from the server with an optional reason.

## Contributing

We welcome contributions!

1. **Fork the Repository**

   Click the "Fork" button at the top right of the GitHub page.

2. **Create a New Branch**

   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Make Your Changes**

   Add new features, fix bugs, or improve documentation.

4. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "Add new feature"
   ```

5. **Push to Your Fork**

   ```bash
   git push origin feature/my-new-feature
   ```

6. **Create a Pull Request**

   Go to the original repository and click "New Pull Request". Describe your changes and submit.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

If you have any issues or questions, feel free to open an issue on GitHub or join our [Discord server](https://dsc.gg/3rr0r).