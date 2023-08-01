import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import CoursesManager from "../courses/courses_manager";
import { isCourseCode } from '../utilities';
import { CourseCode } from '../types';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('course_add')
		.setDescription('Adds a course to the server.')
        .setDefaultMemberPermissions(8)     // admin
        .addStringOption(option => 
            option
                .setName("course_code")
                .setDescription("The course code you would like to add. E.g. CSSE1001")
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

            let response = await coursesManager.addCourse(courseCode);
            if (!response) {
                response = "Course already exists.";
            }

            await interaction.editReply(response);
        } else {
            await interaction.reply("[ERROR] Cannot access server.");
        }
	},
};