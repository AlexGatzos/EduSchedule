-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isRepeating" BOOLEAN NOT NULL,
    "repeatDays" TEXT NOT NULL,
    "repeatInterval" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "teachersId" INTEGER,
    "excludedDates" TEXT,
    CONSTRAINT "Event_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Event_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Event_teachersId_fkey" FOREIGN KEY ("teachersId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "equipment" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "semester" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacher_id" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CourseTeachers" (
    "courseId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,

    PRIMARY KEY ("courseId", "teacherId"),
    CONSTRAINT "CourseTeachers_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("course_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseTeachers_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Calendars" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseIds" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_name_key" ON "Classroom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_course_id_key" ON "Course"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_teacher_id_key" ON "Teacher"("teacher_id");
