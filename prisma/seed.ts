import { PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import { join } from "path";
import csv from "csv-parser";

let prisma = new PrismaClient();

const BASE_DIR = join(
  import.meta.url.replace("seed.ts", "").replace("file://", ""),
  "data",
);

async function readCSVRows(path: string) {
  return new Promise<any[]>(async (resolve, reject) => {
    let rows: any[] = [];
    // Push the data into the readable stream
    createReadStream(path)
      .pipe(csv({ separator: ";" })) // Ορίζουμε τον διαχωριστή των πεδίων
      .on("data", async (row: any) => {
        rows.push(row);
      })
      .on("end", () => {
        resolve(rows);
      });
  });
}

async function seedEvents() {
  let rows = await readCSVRows(join(BASE_DIR, "events.csv"));

  for (let row of rows) {
    let isRepeating = row.isRepeating === "True";
    let course_id = parseInt(row.course_id, 10);
    let startDate = new Date(row.startDate);
    let endDate = new Date(row.endDate);
    await prisma.event.create({
      data: {
        name: row.name,
        startTime: row.startTime,
        endTime: row.endTime,
        isRepeating: isRepeating,
        repeatDays: row.repeatDays,
        repeatInterval: row.repeatInterval,
        startDate: startDate,
        endDate: endDate,
        course: {
          connect: {
            course_id: course_id,
          },
        },
        classroom: {
          connect: {
            name: row.classroom_name,
          },
        },
      },
    });
  }
}

async function seedClassrooms() {
  let rows = await readCSVRows(join(BASE_DIR, "classrooms.csv"));

  for (let row of rows) {
    await prisma.classroom.upsert({
      where: {
        name: row.name,
      },
      create: {
        building: row.building,
        capacity: row.capacity,
        name: row.name,
        equipment: row.equipment,
      },
      update: {
        building: row.building,
        capacity: row.capacity,
        name: row.name,
        equipment: row.equipment,
      },
    });
  }
}

async function seedTeachers() {
  let rows = await readCSVRows(join(BASE_DIR, "teachers.csv"));

  for (let row of rows) {
    let teacher_id = parseInt(row.teacher_id, 10);
    await prisma.teacher.upsert({
      where: {
        teacher_id: teacher_id,
      },
      create: {
        teacher_id: teacher_id,
        fullName: row.fullName,
        role: row.role,
      },
      update: {
        teacher_id: teacher_id,
        fullName: row.fullName,
        role: row.role,
      },
    });
  }
}

async function seedCourses() {
  let rows = await readCSVRows(join(BASE_DIR, "courses.csv"));

  for (let row of rows) {
    // Explicitly define the type of 'row' as 'any'
    // Εισάγουμε τα δεδομένα στον πίνακα Course

    await prisma.course.upsert({
      where: {
        course_id: parseInt(row.course_id, 10),
      },
      create: {
        type: row.type,
        course_id: parseInt(row.course_id, 10),
        name: row.desc,
        semester: row.ex,
      },
      update: {
        type: row.type,
        course_id: parseInt(row.course_id, 10),
        name: row.desc,
        semester: row.ex,
      },
    });
    await prisma.courseTeachers.create({
      data: {
        course: { connect: { course_id: parseInt(row.course_id, 10) } },
        teacher: { connect: { teacher_id: parseInt(row.teacherId, 10) } },
      },
    });
  }
}

async function seed() {
  await seedClassrooms();
  await seedTeachers();
  await seedCourses();
  await seedEvents();
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
