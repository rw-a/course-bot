import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import CoursesStorage from "../courses/courses-storage";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('courses')
		.setDescription('Gets the list of courses.'),
	async execute(interaction: CommandInteraction) {
		const coursesStorage = new CoursesStorage();

		// Group the courses by their letter codes
		let response = "Here are the courses:```";
		let lastCourseGroup = "";
		for (const courseCode of coursesStorage.courses) {
			const courseGroup = courseCode.slice(0, 4);
			if (courseGroup === lastCourseGroup) {
				response += `\t${courseCode}`;
			} else {
				response += `\n${courseCode}`;
				lastCourseGroup = courseGroup;
			}
		}

		response += "```";

		await interaction.reply(response);
	},
};