import ColorsStorage from "./colors-storage";
import CoursesStorage from "./courses-storage";
import { Guild, Role, GuildTextBasedChannel, CategoryChannel, ChannelType } from "discord.js";

export default class CoursesManager {
    guild: Guild
    courses: CoursesStorage
    colors: ColorsStorage

    constructor(guild: Guild) {
        this.guild = guild;
        this.courses = new CoursesStorage();
        this.colors = new ColorsStorage();
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
            channelCategories.get(courseGroup) 
            : 
            await this.guild.channels.create({
                name: courseGroup,
                type: ChannelType.GuildCategory
            }
        );;

        return channelCategory as CategoryChannel;
    }

    async syncCoursesWithServer() {
        let response = "";

        const roles = this.getRoleMap();
        const channels = this.getChannelMap();

        // Find courses which are stored but not a role
        for (const [courseGroup, courseCodes] of this.courses.getCourses()) {
            const channelCategory = await this.getCategoryChannel(courseGroup);   // not ideal but works

            for (const courseCode of courseCodes) {
                // Create role for course if missing
                if (!roles.has(courseCode)) {
                   this.createRole(courseCode);
                   response += `Created a role for ${courseCode}\n`;
                }
    
                // Create channel for course if missing
                if (!channels.has(courseCode.toLowerCase() as Lowercase<string>)) {
                    this.createChannel(courseCode, channelCategory);
                    response += `Created a channel for ${courseCode}\n`;
                }
            }
        }
        
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
        const channel = channels.get(courseCode);

        if (role) this.guild.roles.delete(role);
        if (channel) this.guild.channels.delete(channel);
    }
}