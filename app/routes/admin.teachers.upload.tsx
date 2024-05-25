import type { ActionFunctionArgs } from "@remix-run/node";
import {
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";

import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";
import { Readable, csv } from "~/stream.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (!user.profile.isAdmin) {
    return redirect("/");
  }

  let uploadHandler = unstable_composeUploadHandlers(
    // our custom upload handler
    async ({ name, contentType, data, filename }) => {
      if (name !== "file") {
        return undefined;
      }

      async function readCSVRows() {
        return new Promise<any[]>(async (resolve, reject) => {
          let readableStream = new Readable(); // Create a readable stream

          let rows: any[] = [];
          // Push the data into the readable stream
          readableStream
            .pipe(csv({ separator: ";" })) // Ορίζουμε τον διαχωριστή των πεδίων
            .on("data", async (row: any) => {
              rows.push(row);
            })
            .on("end", () => {
              resolve(rows);
            });

          for await (let chunk of data) {
            readableStream.push(chunk);
          }
          readableStream.push(null); // Mark the end of the stream
        });
      }

      let rows = await readCSVRows();

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
    },

    // fallback to memory for everything else
    unstable_createMemoryUploadHandler(),
  );

  await unstable_parseMultipartFormData(request, uploadHandler);
  return null;
};
