import { Client, Collection, SlashCommandBuilder } from "discord.js";
import COURSES from "../data/courses.json";

export type CommandClient = Client & {
  commands?: Collection<string, SlashCommandBuilder>
}

export type CourseGroup = Uppercase<keyof typeof COURSES>;
export type CourseCode = `${CourseGroup}${number}`
export type ChannelName = `${Lowercase<CourseGroup>}${number}`;