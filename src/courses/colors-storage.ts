import fs from "node:fs";

export default class ColorsStorage {
    colors: {[key: string]: string}

    COLORS_FILE = "colors.json" as const;
    DISCORD_COLORS = [
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
            this.colors = {};
            this.saveStorage();
        }
    }

    saveStorage() {
        fs.writeFileSync(this.COLORS_FILE, JSON.stringify(this.colors));
    }

    addColor(courseGroup: string, color: string) {
        this.colors[courseGroup] = JSON.parse(color);
        this.saveStorage();
    }

    getRandomColor() {
        return this.DISCORD_COLORS[Math.floor(Math.random() * this.DISCORD_COLORS.length)];
    }

    getColor(courseCode: string) {
        const courseGroup = courseCode.slice(4);    // only get the letters of the course code

        if (this.colors.hasOwnProperty(courseGroup)) {
            return this.colors[courseGroup];
        } else {
            const newColor = this.getRandomColor();
            this.addColor(courseCode, newColor);
            return newColor;
        }
    }
}