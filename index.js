/* Initialization */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, Partials, GatewayIntentBits, Collection, Routes } = require("discord.js");
const Utils = require("./utils");
const { REST } = require("@discordjs/rest");

const settings = JSON.parse(
  fs.readFileSync(path.join(__dirname, "settings.json"), "utf8"),
);
const dbPath = path.join(__dirname, "db.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
const utils = new Utils();

/* Command Handler */
function loadCommands() {
  client.commands.clear();
  const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(
    (file) => file.endsWith(".js"),
  );
  const commands = [];

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && typeof command.data.toJSON === "function") {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);

      if (settings.logCommandsInit) {
        utils.log(`Loaded command: ${command.data.name}`, "info");
      }
    } else {
      utils.error(
        `Command ${file} is missing 'data' property or 'toJSON' method.`,
      );
    }
  }

  return commands;
}

const commands = loadCommands();

client.once("ready", async () => {
  if (!client.user) {
    utils.error("Client user is null.");
    return;
  }

  try {
    if (settings.logCommandsInit) {
      utils.log("Started refreshing application (/) commands.", "info");
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });

    if (settings.logCommandsInit) {
      utils.log("Successfully reloaded application (/) commands.", "info");
    }
  } catch (error) {
    utils.error(`Error reloading commands: ${error}`);
  }

  if (settings.initMessage.enabled) {
    utils.log(settings.initMessage.message, "info");
  }

  setInterval(checkBans, settings.banCheckTime * 1000);
});

/* Ban Check Function */
async function checkBans() {
  if (!fs.existsSync(dbPath)) return;

  let db;
  try {
    db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch (error) {
    utils.error(`Error reading db file: ${error}`);
    return;
  }

  for (const guildId of Object.keys(db)) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;

    for (const userId of Object.keys(db[guildId])) {
      const banInfo = db[guildId][userId];
      if (banInfo.unbanTimestamp && Date.now() > banInfo.unbanTimestamp) {
        try {
          await guild.members.unban(userId);
          utils.log(`Unbanned user ${userId} from guild ${guildId}`, "success");
          delete db[guildId][userId];
        } catch (error) {
          utils.error(
            `Failed to unban user ${userId} from guild ${guildId}: ${error.message}`,
          );
        }
      }
    }
  }

  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    utils.error(`Error writing to db file: ${error}`);
  }
}

/* Event Listener */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    await utils.tempReply(interaction, {
      content: settings.invalidCommand.message,
      ephemeral: false,
      time: settings.invalidCommand.timeout,
      showTime: true,
    });
    return;
  }

  try {
    await command.execute(interaction, utils, client);
  } catch (error) {
    utils.error(`Error executing command ${interaction.commandName}: ${error}`);
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: "There was an error executing this command!",
          ephemeral: false,
        });
      } catch (replyError) {
        utils.error(`Error sending error reply: ${replyError}`);
      }
    }
  }
});

/* AI DM Integration */
client.on("messageCreate", async (message) => {
  if (!message.author.bot && !message.guild) {
    try {
      // typing
      await message.channel.sendTyping();
      const response = await utils.generateXAIResponse(message.content);
      await message.channel.send(response);
    } catch (error) {
      utils.error(`Error processing message: ${error}`);
      await message.channel.send("There was an error processing your message.");
    }
  }
});

/* Log Command Initialization */
if (settings.logCommandsInit) {
  utils.log("Commands have been initialized.", "info");
}

/* Login or Exit */
if (process.argv.includes("noToken")) {
  utils.log("noToken flag detected. Exiting...", "info");
  setTimeout(() => process.exit(0), 1000);
} else {
  client.login(process.env.TOKEN).catch((error) => {
    utils.error(`Failed to login: ${error}`);
    process.exit(1);
  });
}