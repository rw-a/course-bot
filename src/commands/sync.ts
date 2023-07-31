import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import CoursesManager from "../courses/courses-manager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sync')
		.setDescription('Copies the database of courses into the server.'),
	async execute(interaction: CommandInteraction) {
        if (interaction.guild) {
            // await interaction.deferReply();
            const coursesManager = new CoursesManager(interaction.guild);
            const response = await coursesManager.syncCoursesWithServer();
            await interaction.reply(response);
        } else {
            await interaction.reply("[ERROR] Cannot access server.");
        }
	},
};