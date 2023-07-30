import ColorsStorage from "./colors-storage";
import CoursesStorage from "./courses-storage";
import { Guild, Role, GuildTextBasedChannel, ColorResolvable, CategoryChannel } from "discord.js";

export default class CoursesManager {
    channelCategory: CategoryChannel
    storage: CoursesStorage
    colors: ColorsStorage

    constructor(channelCategory: CategoryChannel) {
        this.channelCategory = channelCategory;
        this.storage = new CoursesStorage();
        this.colors = new ColorsStorage();
    }

    syncCoursesWithServer(guild: Guild) {
        const roles = new Map<string, Role>();
        for (const [roleID, role] of guild.roles.cache) {
            roles.set(role.name, role);
        }
        
        const channels = new Map<string, GuildTextBasedChannel>();
        for (const [channelID, channel] of guild.channels.cache) {
            if (channel.isTextBased()) {
                channels.set(channel.name, channel);
            }
        }

        // Find courses which are stored but not a role
        for (const courseCode of this.storage.courses) {
            // Create role for course if missing
            if (!roles.has(courseCode)) {
                const color = this.colors.getColor(courseCode) as ColorResolvable;
                guild.roles.create({
                    name: courseCode,
                    color: color,
                    permissions: BigInt(0)  // no permissions
                });
            }

            // Create channel for course if missing
            if (!channels.has(courseCode)) {
                guild.channels.create({
                    parent: this.channelCategory,
                    name: courseCode
                });
            }
        }
    }

    addCourse() {

    }

    deleteCourse() {

    }
}