import ColorsStorage from "./colors-storage";
import CoursesStorage from "./courses-storage";
import {
    Guild, Role, GuildTextBasedChannel, CategoryChannel, ChannelType, APIGuildOnboarding, Routes,
    APIGuildOnboardingPrompt, GuildOnboardingPromptType, APIGuildOnboardingPromptOption
} from "discord.js";

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
        const roles = new Map<string, Role>();
        for (const [roleID, role] of this.guild.roles.cache) {
            roles.set(role.name, role);
        }
        return roles;
    }

    getChannelMap() {
        // Maps channel name to the channel object
        const channels = new Map<Lowercase<string>, GuildTextBasedChannel>();
        for (const [channelID, channel] of this.guild.channels.cache) {
            if (channel.isTextBased()) {
                channels.set(channel.name.toLowerCase() as Lowercase<string>, channel);
            }
        }
        return channels;
    }

    getChannelCategoryMap() {
        // Maps channel name to the channel category object
        const channels = new Map<string, CategoryChannel>();
        for (const [channelID, channel] of this.guild.channels.cache) {
            if (channel.type == ChannelType.GuildCategory) {
                channels.set(channel.name, channel);
            }
        }
        return channels;
    }

    async getCategoryChannel(courseCode: string) {
        // Gets the category channel of the given course code. Creates it if missing.

        const courseGroup = courseCode.slice(0, 4);
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
        const onboardingPromptMap = new Map<string, APIGuildOnboardingPrompt>();
        for (const onboardingPrompt of this.onboarding.prompts) {
            onboardingPromptMap.set(onboardingPrompt.title, onboardingPrompt);
        }
        return onboardingPromptMap;
    }

    getOnBoardingPrompt(courseGroup: string) {
        const onboardingPrompts = this.getOnboardingPromptMap();

        let onboardingPrompt: APIGuildOnboardingPrompt; 
        if (onboardingPrompts.has(courseGroup)) {
            onboardingPrompt = onboardingPrompts.get(courseGroup) as APIGuildOnboardingPrompt
        } else {
            onboardingPrompt = this.createOnboardingPrompt(courseGroup);
            this.onboarding.prompts.push(onboardingPrompt);
            // this.sendOnboardingInfo();
        }

        return onboardingPrompt;
    }

    createOnboardingPrompt(title: string): APIGuildOnboardingPrompt {
        // Note, you need to push this to Discord before adding options for the onboarding prompt to actually be created
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
        const onBoardingPromptOptions = new Map<string, APIGuildOnboardingPromptOption>();
        for (const onboardingPromptOption of onboardingPrompt.options) {
            onBoardingPromptOptions.set(onboardingPromptOption.title, onboardingPromptOption);
        }
        return onBoardingPromptOptions;
    }

    createOnboardingPromptOption(title: string, roleIDs: string[] = [], channelIDs: string[] = [], description: string = ""): APIGuildOnboardingPromptOption {
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

    async syncCoursesWithServer() {
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
                if (channels.has(courseCode.toLowerCase() as Lowercase<string>)) {
                    channel = channels.get(courseCode.toLowerCase() as Lowercase<string>) as GuildTextBasedChannel;
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

    async createRole(courseCode: string) {
        const color = this.colors.getColor(courseCode);
        return this.guild.roles.create({
            name: courseCode,
            color: color,
            permissions: BigInt(0)  // no permissions
        });
    }

    async createChannel(courseCode: string, parent: CategoryChannel) {
        return this.guild.channels.create({
            parent: parent,
            name: courseCode
        });
    }

    async addCourse(courseCode: string) {
        this.courses.addCourse(courseCode);
        this.createRole(courseCode).catch(console.error);
        const categoryChannel = await this.getCategoryChannel(courseCode);
        this.createChannel(courseCode, categoryChannel).catch(console.error);
    }

    deleteCourse(courseCode: string) {
        this.courses.deleteCourse(courseCode);

        const roles = this.getRoleMap();
        const channels = this.getChannelMap();

        const role = roles.get(courseCode);
        const channel = channels.get(courseCode.toLowerCase() as Lowercase<string>);

        if (role) this.guild.roles.delete(role);
        if (channel) this.guild.channels.delete(channel);
    }
}