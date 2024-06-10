import type { LoaderFunction } from "@remix-run/node";

import { prisma } from "~/database.server";
import { createEvent, createICS } from "app/routes/ics-utils";

export let loader: LoaderFunction = async ({ request }) => {
  let events = await prisma.event.findMany({
    include: {
      classroom: true,
      course: true,
      teachers: true,
    },
  });

  let icsEvents = events.map(createEvent);
  let icsFile = createICS(icsEvents);

  return new Response(icsFile, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": "attachment; filename=calendar.ics",
    },
  });
};
