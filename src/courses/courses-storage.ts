import fs from "node:fs";

export default class CoursesStorage {
    courses: string[]

    COURSES_FILE = "courses.json" as const;

    constructor() {
        const coursesRawData = fs.readFileSync(this.COURSES_FILE);
        this.courses = JSON.parse(coursesRawData.toString());
    }

    saveStorage() {
        fs.writeFileSync(this.COURSES_FILE, JSON.stringify(this.courses));
    }

    addCourse(courseCode: string) {
        this.courses.push(courseCode);
        this.courses.sort();

        this.saveStorage();
    }

    deleteCourse(courseCode: string) {
        if (this.courses.includes(courseCode)) {
            const index = this.courses.indexOf(courseCode);
            this.courses.splice(index);
        }
        
        this.saveStorage();
    }
}