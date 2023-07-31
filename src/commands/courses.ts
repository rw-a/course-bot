import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import CoursesStorage from "../courses/courses-storage";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('courses')
		.setDescription('Gets the list of courses.'),
	async execute(interaction: CommandInteraction) {
		const coursesStorage = new CoursesStorage();
		await interaction.reply(`Here are the courses:\n ${coursesStorage.courses.join("\n")}`);
	},
};