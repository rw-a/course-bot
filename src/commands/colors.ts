import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import CoursesManager from "../courses/courses-manager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('colors')
		.setDescription('Updates the colors of the roles.')
        .setDefaultMemberPermissions(8),    // admin
	async execute(interaction: CommandInteraction) {
        if (interaction.guild) {
            // await interaction.deferReply(); // might take a while so tell Discord to be patient

            const coursesManager = new CoursesManager(interaction.guild);
            const response = coursesManager.updateColors();

            await interaction.reply(response);
        } else {
            await interaction.reply("[ERROR] Cannot access server.");
        }
	},
};