import type { LoaderFunction } from "@remix-run/node";
import { prisma } from "~/database.server";
import { createEvent, createICS } from "app/routes/ics-utils";

export let loader: LoaderFunction = async ({ params }) => {
  let calendarId = params.uuid;

  let calendar = await prisma.calendars.findFirst({
    where: { uuid: calendarId },
  });

  if (!calendar) {
    throw new Response("Calendar not found", { status: 404 });
  }

  let courseIds = JSON.parse(calendar.courseIds);

  let events = await prisma.event.findMany({
    where: {
      courseId: {
        in: courseIds,
      },
    },
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
