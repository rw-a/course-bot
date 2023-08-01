import { REST, Routes } from "discord.js";
import CONFIG from "../config.json";

const rest = new REST().setToken(CONFIG.token);

// for guild-based commands
rest.put(Routes.applicationGuildCommands(CONFIG.applicationId, CONFIG.guildId), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);