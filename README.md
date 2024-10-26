<p align="center">
  <a href="https://discord.com/oauth2/authorize?client_id=1223073528954490940&scope=bot">
    <img src="images/nala.gif" alt="Nala" />
  </a>
</p>

# Nala

**Nala** is an open-source Discord bot designed to meet various needs with a
flexible command structure and seamless integration with Discord's API.

[![Join Our Discord](https://img.shields.io/badge/Discord-Join%20Us-7289DA?logo=discord&logoColor=white)](https://dsc.gg/3rr0r)  
[![Invite Nala](https://img.shields.io/badge/Invite%20Nala-Click%20Here-blue?logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1223073528954490940&scope=bot)

## Features

- **Slash Commands**: Easily define and manage commands.
- **Subcommands**: Organize commands for better functionality.
- **Utility Functions**: Built-in utilities for logging and temporary replies.
- **Customizable Configuration**: Manage settings for initialization and command logging.
- **Deno Compatibility**: Run the bot with [Deno](https://deno.land/) for improved performance and security.

## Table of Contents

- [Installation](#installation)
  - [Node.js Setup](#nodejs-setup)
  - [Deno Setup](#deno-setup)
- [Usage](#usage)
  - [Starting the Bot](#starting-the-bot)
  - [Defining Commands](#defining-commands)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Installation

### Node.js Setup

#### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher) OR [Deno](https://deno.land/)
- [Git](https://git-scm.com/)

#### Steps

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
     "invalidCommand": {
       "enabled": true,
       "timeout": 1,
       "message": "## Woops! How did this happen?\nThis command does not exist! 😅"
     },
     "initMessage": {
       "enabled": true,
       "message": "Nala is ready for liftoff! 🚀"
     },
     "logCommandsInit": true,
     "banCheckTime": 60,
     "alertBanToUser": true,
     "useOpenAIWhisperAPI": false,
     "bugReport": {
       "enabled": true,
       "webhook": ""
     }
   }
   ```

#### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Its3rr0rsWRLD/nala.git
   cd nala
   ```

2. **Run the Bot with Deno**

   Use the following command to start the bot:

   ```bash
   deno run --allow-net --allow-env --allow-read src/main.ts
   ```

3. **Set Up Environment Variables**

   Ensure your `.env` file contains the bot token:

   ```env
   TOKEN=your_discord_bot_token_here
   ```

4. **Install Deno Dependencies** (Optional)

   If any additional Deno modules are required, install them using:

   ```bash
   deno install [module]
   ```

## Usage

### Starting the Bot

#### With Node.js

Run the bot using:

```bash
npm start
```

#### With Deno

```bash
deno run --allow-net --allow-env --allow-read src/main.ts
```

### Defining Commands

Place your command files in the `commands` directory. Each command file should export an object with `data` and `execute` properties.

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