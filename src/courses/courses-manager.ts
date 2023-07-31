import ColorsStorage from "./colors-storage";
import CoursesStorage from "./courses-storage";
import { Guild, Role, GuildTextBasedChannel, ColorResolvable, CategoryChannel } from "discord.js";

export default class CoursesManager {
    guild: Guild
    channelCategory: CategoryChannel
    courses: CoursesStorage
    colors: ColorsStorage

    constructor(guild: Guild, channelCategory: CategoryChannel) {
        this.guild = guild;
        this.channelCategory = channelCategory;
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
        const channels = new Map<string, GuildTextBasedChannel>();
        for (const [channelID, channel] of this.guild.channels.cache) {
            if (channel.isTextBased()) {
                channels.set(channel.name, channel);
            }
        }
        return channels;
    }

    syncCoursesWithServer() {
        let response = "";

        const roles = this.getRoleMap();
        const channels = this.getChannelMap();

        // Find courses which are stored but not a role
        for (const courseCode of this.courses.courses) {
            // Create role for course if missing
            if (!roles.has(courseCode)) {
               this.createRole(courseCode);
               response += `Created a role for ${courseCode}\n`;
            }

            // Create channel for course if missing
            if (!channels.has(courseCode)) {
                this.createChannel(courseCode);
                response += `Created a channel for ${courseCode}\n`;
            }
        }
        
        return response;
    }

    async createRole(courseCode: string) {
        const color = this.colors.getColor(courseCode) as ColorResolvable;
        return this.guild.roles.create({
            name: courseCode,
            color: color,
            permissions: BigInt(0)  // no permissions
        });
    }

    async createChannel(courseCode: string) {
        return this.guild.channels.create({
            parent: this.channelCategory,
            name: courseCode
        });
    }

    addCourse(courseCode: string) {
        this.courses.addCourse(courseCode);
        this.createRole(courseCode).catch(console.error);
        this.createChannel(courseCode).catch(console.error);
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