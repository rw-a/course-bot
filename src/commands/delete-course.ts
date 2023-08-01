import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import CoursesManager from "../courses/courses-manager";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('course_delete')
		.setDescription('Deletes a course from the server.')
        .setDefaultMemberPermissions(8)     // admin
        .addStringOption(option => 
            option
                .setName("course_code")
                .setDescription("The course code you would like to delete. E.g. CSSE1001")
                .setRequired(true)),    
	async execute(interaction: CommandInteraction) {
        if (interaction.guild) {
            // await interaction.deferReply(); // might take a while so tell Discord to be patient

            const courseCode = interaction.options.getString("course_code") as string;

            if (courseCode.length != 8) {
                await interaction.reply("Invalid course code.");
                return;
            }

            const coursesManager = new CoursesManager(interaction.guild);
            await coursesManager.getOnboardingData();

            let response = coursesManager.deleteCourse(courseCode);
            if (!response) {
                response = "Nothing to delete";
            }

            await interaction.reply(response);
        } else {
            await interaction.reply("[ERROR] Cannot access server.");
        }
	},
};