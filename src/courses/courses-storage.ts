import fs from "node:fs";

export default class CoursesStorage {
    courses: string[]

    COURSES_FILE = "courses.json" as const;

    constructor() {
        const coursesRawData = fs.readFileSync(this.COURSES_FILE);
        this.courses = JSON.parse(coursesRawData.toString());
    }

    save_storage() {
        fs.writeFileSync(this.COURSES_FILE, JSON.stringify(this.courses));
    }

    add_course(courseCode: string) {
        this.courses.push(courseCode);
        this.courses.sort();

        this.save_storage();
    }

    delete_course(courseCode: string) {
        if (this.courses.includes(courseCode)) {
            const index = this.courses.indexOf(courseCode);
            this.courses.splice(index);
        }
        
        this.save_storage();
    }
}