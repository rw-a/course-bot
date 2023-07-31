import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import CoursesManager from "../courses/courses-manager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sync')
		.setDescription('Copies the database of courses into the server.')
        .setDefaultMemberPermissions(8),    // admin
	async execute(interaction: CommandInteraction) {
        if (interaction.guild) {
            // await interaction.deferReply();
            const coursesManager = new CoursesManager(interaction.guild);
            let response = await coursesManager.syncCoursesWithServer();
            if (!response) {
                response = "All up to date.";
            }
            await interaction.reply(response);
        } else {
            await interaction.reply("[ERROR] Cannot access server.");
        }
	},
};