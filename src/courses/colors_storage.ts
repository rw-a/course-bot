import { ColorResolvable } from "discord.js";
import fs from "node:fs";
import path from "node:path";

export default class ColorsStorage {
    colors: {[key: string]: ColorResolvable}

    COLORS_FILE = path.join(__dirname, "..", "..", "data", "colors.json");
    DISCORD_COLORS: ColorResolvable[] = [
        "White",
        "Aqua",
        "Green",
        "Blue",
        "Yellow",
        "Purple",
        "LuminousVividPink",
        "Fuchsia",
        "Gold",
        "Orange",
        "Red",
        "Grey",
        "Navy",
        "DarkAqua",
        "DarkGreen",
        "DarkBlue",
        "DarkPurple",
        "DarkVividPink",
        "DarkGold",
        "DarkOrange",
        "DarkRed",
        "DarkGrey",
        "DarkerGrey",
        "LightGrey",
        "DarkNavy",
        "Blurple",
        "Greyple",
        "DarkButNotBlack",
        "NotQuiteBlack",
    ];

    constructor() {
        if (fs.existsSync(this.COLORS_FILE)) {
            const colorsRawData = fs.readFileSync(this.COLORS_FILE);
            this.colors = JSON.parse(colorsRawData.toString());
        } else {
            console.log(`[WARNING] ${this.COLORS_FILE} missing. Generating a blank one.`);
            this.colors = {};
            this.saveStorage();
        }
    }

    saveStorage() {
        fs.writeFileSync(this.COLORS_FILE, JSON.stringify(this.colors, null, 2));
    }

    addColor(courseGroup: string, color: ColorResolvable) {
        this.colors[courseGroup] = color;
        this.saveStorage();
    }

    getRandomColor() {
        return this.DISCORD_COLORS[Math.floor(Math.random() * this.DISCORD_COLORS.length)];
    }

    getColor(courseCode: string) {
        const courseGroup = courseCode.slice(0, 4);    // only get the letters of the course code

        if (this.colors.hasOwnProperty(courseGroup)) {
            return this.colors[courseGroup];
        } else {
            const newColor = this.getRandomColor();
            this.addColor(courseGroup, newColor);
            return newColor;
        }
    }
}