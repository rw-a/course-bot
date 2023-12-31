import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import CoursesManager from "../courses/courses_manager";
import { isCourseCode } from '../utilities';
import { CourseCode } from '../types';

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
            const courseCode = interaction.options.getString("course_code").toUpperCase() as CourseCode;
            
            if (!isCourseCode(courseCode)) {
                await interaction.reply("Invalid course code.");
                return;
            }

            await interaction.deferReply(); 

            const coursesManager = new CoursesManager(interaction.guild);
            await coursesManager.getOnboardingData();

            let response = await coursesManager.deleteCourse(courseCode);
            if (!response) {
                response = "Nothing to delete";
            }

            await interaction.editReply(response);
        } else {
            await interaction.reply("[ERROR] Cannot access server.");
        }
	},
};