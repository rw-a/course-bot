import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('courses')
		.setDescription('Gets the list of courses.'),
	async execute(interaction: CommandInteraction) {
		console.log(await interaction.guild?.fetchOnboarding());
		await interaction.reply('Here are the courses:');
	},
};