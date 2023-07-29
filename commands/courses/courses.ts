import { SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('courses')
		.setDescription('Gets the list of courses.'),
	async execute(interaction) {
		console.log("Courses");
		await interaction.reply('Here are the courses:');
	},
};