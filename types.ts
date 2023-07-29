import { Client, Collection, SlashCommandBuilder } from "discord.js";

export type CommandClient = Client & {
    commands?: Collection<string, SlashCommandBuilder>
}