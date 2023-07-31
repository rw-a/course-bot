import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import CoursesStorage from "../courses/courses-storage";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('courses')
		.setDescription('Gets the list of courses.')
		.setDefaultMemberPermissions(8),	// admin
	async execute(interaction: CommandInteraction) {
		const coursesStorage = new CoursesStorage();

		// Group the courses by their letter codes
		let response = "Here are the courses:```";

		for (const [courseGroup, courseCodes] of coursesStorage.getCourses()) {
			response += courseCodes.join("\t");
			response += "\n";
		}

		response += "```";

		await interaction.reply(response);
	},
};