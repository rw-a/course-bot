import fs from "node:fs";
import path from "node:path";
import { CourseCode, CourseGroup } from "../types";

type CoursesStorageType = {[property in CourseGroup]: CourseCode[]};

export default class CoursesStorage {
    courses: CoursesStorageType

    COURSES_FILE = path.join(__dirname, "..", "..", "data", "courses.json");

    constructor() {
        if (fs.existsSync(this.COURSES_FILE)) {
            const coursesRawData = fs.readFileSync(this.COURSES_FILE);
            this.courses = JSON.parse(coursesRawData.toString());
        } else {
            console.log(`WARNING: ${this.COURSES_FILE} missing. Generating a blank one.`);
            this.courses = {} as CoursesStorageType;
            this.saveStorage();
        }
    }

    saveStorage() {
        fs.writeFileSync(this.COURSES_FILE, JSON.stringify(this.courses, null, 2));
    }

    addCourse(courseCode: CourseCode) {
        const courseGroup = courseCode.slice(0, 4);
        if (this.courses.hasOwnProperty(courseGroup)) {
            if (this.courses[courseGroup].includes(courseCode)) {
                return;
            }
            this.courses[courseGroup].push(courseCode);
            this.courses[courseGroup].sort();
        } else {
            this.courses[courseGroup] = [courseCode];
        }

        this.saveStorage();
    }

    deleteCourse(courseCode: CourseCode) {
        const courseGroup = courseCode.slice(0, 4);
        if (this.courses.hasOwnProperty(courseGroup) && this.courses[courseGroup].includes(courseCode)) {
            const index = this.courses[courseGroup].indexOf(courseCode);
            this.courses[courseGroup].splice(index);
            this.saveStorage();
        }
    }

    getCourses() {
        // Gets the courses as a map where key=courseGroup and value=courses where key is in sorted order
        const courses = new Map<CourseGroup, CourseCode[]>();

        const courseGroups = Object.keys(this.courses) as CourseGroup[];
        courseGroups.sort();

        for (const courseGroup of courseGroups) {
            courses.set(courseGroup, this.courses[courseGroup]);
        }

        return courses;
    }

    getFlattenedCourses() {
        // Gets an array of all the courses
        // It's actually a man where the key and the value are the same, since it has faster lookup

        const allCourses = new Map<CourseCode, CourseCode>();
        const courses = this.getCourses();
        for (const [courseGroup, courseCodes] of courses) {
            for (const courseCode of courseCodes) {
                allCourses.set(courseCode, courseCode);
            }
        }
        return allCourses;
    }
}