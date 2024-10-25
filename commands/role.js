const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Assign or remove a role from yourself")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a role")
        .addRoleOption((option) =>
          option.setName("role").setDescription("Select a role").setRequired(
            true,
          )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a role")
        .addRoleOption((option) =>
          option.setName("role").setDescription("Select a role").setRequired(
            true,
          )
        )
    ),

  execute: async (interaction) => {
    const role = interaction.options.getRole("role");
    const member = interaction.member;
    const subcommand = interaction.options.getSubcommand();

    // Optional: Limit roles that can be self-assigned
    const selfAssignableRoles = ["RoleID1", "RoleID2"]; // Replace with actual role IDs
    if (!selfAssignableRoles.includes(role.id)) {
      return interaction.reply({
        content: "You cannot assign or remove this role.",
        ephemeral: true,
      });
    }

    if (subcommand === "add") {
      if (member.roles.cache.has(role.id)) {
        return interaction.reply({
          content: "You already have this role.",
          ephemeral: true,
        });
      }
      await member.roles.add(role);
      await interaction.reply({
        content: `Role ${role.name} has been added to you.`,
        ephemeral: true,
      });
    } else if (subcommand === "remove") {
      if (!member.roles.cache.has(role.id)) {
        return interaction.reply({
          content: "You do not have this role.",
          ephemeral: true,
        });
      }
      await member.roles.remove(role);
      await interaction.reply({
        content: `Role ${role.name} has been removed from you.`,
        ephemeral: true,
      });
    }
  },
};
