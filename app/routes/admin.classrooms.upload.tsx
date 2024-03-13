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
        console.log(row);
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
    },

    unstable_createMemoryUploadHandler(),
  );

  await unstable_parseMultipartFormData(request, uploadHandler);
  return null;
};