import ColorsStorage from "./colors_storage";
import CoursesStorage from "./courses_storage";
import {
    Guild, Role, GuildTextBasedChannel, CategoryChannel, ChannelType, APIGuildOnboarding, Routes,
    APIGuildOnboardingPrompt, GuildOnboardingPromptType, APIGuildOnboardingPromptOption, resolveColor
} from "discord.js";
import { CourseCode, CourseGroup, ChannelName } from "../types";

function generateID(len: number) {
    let result = '';
    const characters = '0123456789';
    for (let i = 0; i < (len); i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

export default class CoursesManager {
    guild: Guild
    courses: CoursesStorage
    colors: ColorsStorage
    onboarding: APIGuildOnboarding

    SNOWFLAKE_LENGTH = 19 as const;

    constructor(guild: Guild) {
        this.guild = guild;
        this.courses = new CoursesStorage();
        this.colors = new ColorsStorage();
    }

    async getOnboardingData() {
        this.onboarding = await this.guild.client.rest.get(Routes.guildOnboarding(this.guild.id)) as APIGuildOnboarding;
    }

    generateRandomSnowflake() {
        const startingNumbers = "100";
        return startingNumbers + generateID(19 - startingNumbers.length);
    }

    getRoleMap() {
        // Maps role name to the role object
        const roles = new Map<CourseCode, Role>();
        for (const [roleID, role] of this.guild.roles.cache) {
            roles.set(role.name.toUpperCase() as CourseCode, role);
        }
        return roles;
    }

    getChannelMap() {
        // Maps channel name to the channel object
        const channels = new Map<ChannelName, GuildTextBasedChannel>();
        for (const [channelID, channel] of this.guild.channels.cache) {
            if (channel.isTextBased()) {
                channels.set(channel.name.toLowerCase() as ChannelName, channel);
            }
        }
        return channels;
    }

    getChannelCategoryMap() {
        // Maps channel name to the channel category object
        const channels = new Map<CourseGroup, CategoryChannel>();
        for (const [channelID, channel] of this.guild.channels.cache) {
            if (channel.type == ChannelType.GuildCategory) {
                channels.set(channel.name.toUpperCase() as CourseGroup, channel);
            }
        }
        return channels;
    }

    async getCategoryChannel(courseCode: CourseCode | CourseGroup) {
        // Gets the category channel of the given course code. Creates it if missing.

        const courseGroup = courseCode.slice(0, 4) as CourseGroup;
        const channelCategories = this.getChannelCategoryMap();

        const channelCategory = (channelCategories.has(courseGroup)) ?
            channelCategories.get(courseGroup) as CategoryChannel
            :
            await this.guild.channels.create({
                name: courseGroup,
                type: ChannelType.GuildCategory
            }
            );

        return channelCategory;
    }

    getOnboardingPromptMap() {
        // Could make shorter using reduce
        const onboardingPromptMap = new Map<CourseGroup, APIGuildOnboardingPrompt>();
        for (const onboardingPrompt of this.onboarding.prompts) {
            onboardingPromptMap.set(onboardingPrompt.title.toUpperCase() as CourseGroup, onboardingPrompt);
        }
        return onboardingPromptMap;
    }

    getOnBoardingPrompt(courseGroup: CourseGroup) {
        const onboardingPrompts = this.getOnboardingPromptMap();

        let onboardingPrompt: APIGuildOnboardingPrompt; 
        if (onboardingPrompts.has(courseGroup)) {
            onboardingPrompt = onboardingPrompts.get(courseGroup) as APIGuildOnboardingPrompt
        } else {
            onboardingPrompt = this.createOnboardingPrompt(courseGroup);
            this.onboarding.prompts.push(onboardingPrompt);
        }

        return onboardingPrompt;
    }

    createOnboardingPrompt(title: CourseGroup): APIGuildOnboardingPrompt {
        return {
            id: this.generateRandomSnowflake(),
            title: title,
            options: [],
            single_select: false,
            type: GuildOnboardingPromptType.MultipleChoice,
            in_onboarding: false,
            required: false
        };
    }

    getOnboardingPromptOptionMap(onboardingPrompt: APIGuildOnboardingPrompt) {
        // Maps an onboarding prompt's name to itself
        const onBoardingPromptOptions = new Map<CourseCode, APIGuildOnboardingPromptOption>();
        for (const onboardingPromptOption of onboardingPrompt.options) {
            onBoardingPromptOptions.set(
                onboardingPromptOption.title.toUpperCase() as CourseCode,
                onboardingPromptOption);
        }
        return onBoardingPromptOptions;
    }

    createOnboardingPromptOption(title: CourseCode, 
            roleIDs: string[] = [], channelIDs: string[] = [], description: string = ""
            ): APIGuildOnboardingPromptOption {

        return {
            title: title,
            role_ids: roleIDs,
            channel_ids: channelIDs,
            emoji: { id: "", name: "" },
            id: this.generateRandomSnowflake(),
            description: description
        };
    }

    async sendOnboardingInfo() {
        await this.guild.client.rest.put(Routes.guildOnboarding(this.guild.id), {body: this.onboarding});
    }

    async generateCourses() {
        // Reads the courses stored in JSON and migrates them into the server
        // Creates a role, channel and onboarding question for each course

        let response = "";  // Sent back to the user who ran the command

        const roles = this.getRoleMap();
        const channels = this.getChannelMap();

        // Find courses which are stored but not a role
        for (const [courseGroup, courseCodes] of this.courses.getCourses()) {
            // Get the associated channel category for the course group, or create it if missing
            const channelCategory = await this.getCategoryChannel(courseGroup);   // not ideal but works

            // Get the associated onboarding prompt for the course group, or create it if missing
            const onboardingPrompt = this.getOnBoardingPrompt(courseGroup);
            const onBoardingPromptOptions = this.getOnboardingPromptOptionMap(onboardingPrompt);

            for (const courseCode of courseCodes) {
                // Create role for course if missing
                let role: Role;
                if (roles.has(courseCode)) {
                    role = roles.get(courseCode) as Role;
                } else {
                    role = await this.createRole(courseCode);
                    response += `Created a role for ${courseCode}\n`;
                }

                // Create channel for course if missing
                let channel: GuildTextBasedChannel;
                if (channels.has(courseCode.toLowerCase() as ChannelName)) {
                    channel = channels.get(courseCode.toLowerCase() as ChannelName) as GuildTextBasedChannel;
                } else {
                    channel = await this.createChannel(courseCode, channelCategory);
                    response += `Created a channel for ${courseCode}\n`;
                }

                // Create option for course if missing
                if (!onBoardingPromptOptions.has(courseCode)) {
                    onboardingPrompt.options.push(this.createOnboardingPromptOption(courseCode, [role.id], [channel.id]));
                    response += `Created an onboarding prompt for ${courseCode}\n`;
                }
            }
        }

        this.sendOnboardingInfo();

        return response;
    }

    async createRole(courseCode: CourseCode) {
        const color = this.colors.getColor(courseCode);
        return this.guild.roles.create({
            name: courseCode,
            color: color,
            permissions: BigInt(0)  // no permissions
        });
    }

    async createChannel(courseCode: CourseCode, parent: CategoryChannel) {
        return this.guild.channels.create({
            parent: parent,
            name: courseCode
        });
    }

    async addCourse(courseCode: CourseCode) {
        let response = "";

        this.courses.addCourse(courseCode);
        
        const roles = this.getRoleMap();
        const channels = this.getChannelMap();
        
        const courseGroup = courseCode.slice(0, 4) as CourseGroup;

        // Get the associated channel category for the course group, or create it if missing
        const channelCategory = await this.getCategoryChannel(courseGroup);   // not ideal but works

        // Get the associated onboarding prompt for the course group, or create it if missing
        const onboardingPrompt = this.getOnBoardingPrompt(courseGroup);
        const onBoardingPromptOptions = this.getOnboardingPromptOptionMap(onboardingPrompt);

        let role: Role;
        if (roles.has(courseCode)) {
            role = roles.get(courseCode) as Role;
        } else {
            role = await this.createRole(courseCode);
            response += `Created a role for ${courseCode}\n`;
        }

        // Create channel for course if missing
        let channel: GuildTextBasedChannel;
        if (channels.has(courseCode.toLowerCase() as ChannelName)) {
            channel = channels.get(courseCode.toLowerCase() as ChannelName) as GuildTextBasedChannel;
        } else {
            channel = await this.createChannel(courseCode, channelCategory);
            response += `Created a channel for ${courseCode}\n`;
        }

        // Create option for course if missing
        if (!onBoardingPromptOptions.has(courseCode)) {
            onboardingPrompt.options.push(this.createOnboardingPromptOption(courseCode, [role.id], [channel.id]));
            response += `Created an onboarding prompt for ${courseCode}\n`;
            this.sendOnboardingInfo();
        }

        return response;
    }

    deleteCourse(courseCode: CourseCode) {
        let response = "";

        const courseGroup = courseCode.slice(0, 4) as CourseGroup;

        this.courses.deleteCourse(courseCode);

        const roles = this.getRoleMap();
        const channels = this.getChannelMap();

        const role = roles.get(courseCode);
        const channel = channels.get(courseCode.toLowerCase() as ChannelName);

        if (role) {
            this.guild.roles.delete(role);
            response += `Deleted role for ${courseCode}\n`;
        }
        if (channel) {
            this.guild.channels.delete(channel);
            response += `Deleted channel for ${courseCode}\n`;
        }

        // Delete the onboarding prompt option
        const onboardingPrompt = this.getOnBoardingPrompt(courseGroup);
        for (const [index, onboardingPromptOption] of Object.entries(onboardingPrompt.options)) {
            if (onboardingPromptOption.title === courseCode) {
                onboardingPrompt.options.splice(index as unknown as number);

                // If the last option was deleted, also delete the entire prompt
                if (onboardingPrompt.options.length === 0) {
                    const promptIndex = this.onboarding.prompts.map((prompt => prompt.title)).indexOf(courseGroup);
                    this.onboarding.prompts.splice(promptIndex);
                }

                this.sendOnboardingInfo();
                response += `Deleted onboarding prompt for ${courseCode}\n`;
                break;
            }
        }

        return response;
    }

    updateColors() {
        let response = "";

        const roles = this.getRoleMap();
        const flattenedCourses = this.courses.getFlattenedCourses();

        for (const [roleName, role] of roles) {
            // If role name is a course
            if (!flattenedCourses.has(roleName)) {
                continue;
            }

            const expectedColor = resolveColor(this.colors.getColor(roleName));

            // If the colors don't match, update the role's color
            if (expectedColor !== role.color) {
                response += `Changed color of ${roleName} from #${role.color.toString(16).toUpperCase()} to #${expectedColor.toString(16).toUpperCase()}\n`;
                role.setColor(expectedColor);
            }
        }

        return response;
    }
}