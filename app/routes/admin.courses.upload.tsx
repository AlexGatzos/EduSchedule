import type { ActionFunctionArgs } from "@remix-run/node";
import {
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { z } from "zod";

import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";
import { Readable, csv } from "~/stream.server";

let coursesCSVRowSchema = z.object({
  course_id: z.coerce.number(),
  type: z.string(),
  desc: z.string(),
  ex: z.string(),
  teacherId: z.coerce.number(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (!user.profile.isAdmin) {
    return redirect("/");
  }

  const uploadHandler = unstable_composeUploadHandlers(
    // our custom upload handler
    async ({ name, contentType, data, filename }) => {
      if (name !== "file") {
        return undefined;
      }

      async function readCSVRows() {
        return new Promise<any[]>(async (resolve, reject) => {
          const readableStream = new Readable(); // Create a readable stream

          const rows: any[] = [];
          // Push the data into the readable stream
          readableStream
            .pipe(csv({ separator: ";" })) // Ορίζουμε τον διαχωριστή των πεδίων
            .on("data", async (row: any) => {
              rows.push(row);
            })
            .on("end", () => {
              resolve(rows);
            });

          for await (const chunk of data) {
            readableStream.push(chunk);
          }
          readableStream.push(null); // Mark the end of the stream
        });
      }

      const rows = await readCSVRows();

      for (const row of rows) {
        let parsedRow = coursesCSVRowSchema.parse(row);
        // Explicitly define the type of 'row' as 'any'
        // Εισάγουμε τα δεδομένα στον πίνακα Course

        await prisma.course.upsert({
          where: {
            course_id: parsedRow.course_id,
          },
          create: {
            type: parsedRow.type,
            course_id: parsedRow.course_id,
            name: parsedRow.desc,
            semester: parsedRow.ex,
          },
          update: {
            type: parsedRow.type,
            course_id: parsedRow.course_id,
            name: parsedRow.desc,
            semester: parsedRow.ex,
          },
        });
        await prisma.courseTeachers.create({
          data: {
            course: { connect: { course_id: parsedRow.course_id } },
            teacher: { connect: { teacher_id: parsedRow.teacherId } },
          },
        });
      }
    },

    // fallback to memory for everything else
    unstable_createMemoryUploadHandler(),
  );

  await unstable_parseMultipartFormData(request, uploadHandler);
  return null;

  // because our uploadHandler returns a string, that's what the imageUrl will be.
  // ... etc
};
