import type { EventAttributes } from "ics";
import { createEvents } from "ics";
import type { Event } from "@prisma/client"; // Assuming Prisma model is available

// Δημιουργία ενός event από τα δεδομένα του Prisma
export function createEvent(eventData: Event): EventAttributes {
  let {
    name,
    startDate,
    endDate,
    startTime,
    endTime,
    isRepeating,
    repeatDays,
    repeatInterval,
    excludedDates,
    classroom,
  } = eventData;

  let startDateTime = new Date(startDate);
  let endDateTime = new Date(endDate);

  let start = [
    startDateTime.getUTCFullYear(),
    startDateTime.getUTCMonth() + 1,
    startDateTime.getUTCDate(),
    ...startTime.split(":").map(Number),
  ];

  let end = [
    endDateTime.getUTCFullYear(),
    endDateTime.getUTCMonth() + 1,
    endDateTime.getUTCDate(),
    ...endTime.split(":").map(Number),
  ];

  let recurrenceRule = isRepeating
    ? `FREQ=${repeatInterval};BYDAY=${repeatDays}`
    : undefined;
  let exdate = excludedDates
    ? JSON.parse(excludedDates).map((date: string) => {
        let exDate = new Date(date);
        return [
          exDate.getUTCFullYear(),
          exDate.getUTCMonth() + 1,
          exDate.getUTCDate(),
        ];
      })
    : undefined;

  return {
    title: name,
    start,
    end,
    recurrenceRule,
    exdate,
    location: `${classroom.building} ${classroom.name}`, // Προσθήκη της αίθουσας ως τοποθεσία
  };
}

// Δημιουργία ενός αρχείου ICS από events
export function createICS(events: EventAttributes[]): string {
  let { error, value } = createEvents(events);

  if (error) {
    throw new Error(error);
  }

  return value;
}
