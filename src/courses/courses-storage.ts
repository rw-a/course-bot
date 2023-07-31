import fs from "node:fs";
import path from "node:path";

export default class CoursesStorage {
    courses: {[key: string]: string[]}

    COURSES_FILE = path.join(__dirname, "..", "..", "data", "courses.json");

    constructor() {
        if (fs.existsSync(this.COURSES_FILE)) {
            const coursesRawData = fs.readFileSync(this.COURSES_FILE);
            this.courses = JSON.parse(coursesRawData.toString());
        } else {
            console.log(`WARNING: ${this.COURSES_FILE} missing. Generating a blank one.`);
            this.courses = {};
            this.saveStorage();
        }
    }

    saveStorage() {
        fs.writeFileSync(this.COURSES_FILE, JSON.stringify(this.courses, null, 2));
    }

    addCourse(courseCode: string) {
        const courseGroup = courseCode.slice(0, 4);
        if (this.courses.hasOwnProperty(courseGroup)) {
            this.courses[courseGroup].push(courseCode);
            this.courses[courseGroup].sort();
        } else {
            this.courses[courseGroup] = [courseCode];
        }

        this.saveStorage();
    }

    deleteCourse(courseCode: string) {
        const courseGroup = courseCode.slice(0, 4);
        if (this.courses.hasOwnProperty(courseGroup) && this.courses[courseGroup].includes(courseCode)) {
            const index = this.courses[courseGroup].indexOf(courseCode);
            this.courses[courseGroup].splice(index);
            this.saveStorage();
        }
    }

    getCourses() {
        // Gets the courses as a map where key=courseGroup and value=courses where key is in sorted order
        const courses = new Map<string, string[]>();

        const courseGroups = Object.keys(this.courses);
        courseGroups.sort();

        for (const courseGroup of courseGroups) {
            courses.set(courseGroup, this.courses[courseGroup]);
        }

        return courses;
    }
}