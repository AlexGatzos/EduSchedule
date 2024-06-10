import type { EventAttributes } from "ics";
import { createEvents } from "ics";

export function createEvent(eventData) {
  let {
    name,
    startDate,
    endDate,
    startTime,
    endTime,
    isRepeating,
    repeatInterval,
    excludedDates,
  } = eventData;

  let event: EventAttributes = {
    title: name,
    start: [
      startDate.getUTCFullYear(),
      startDate.getUTCMonth() + 1,
      startDate.getUTCDate(),
      ...startTime.split(":").map(Number),
    ],
    end: [
      endDate.getUTCFullYear(),
      endDate.getUTCMonth() + 1,
      endDate.getUTCDate(),
      ...endTime.split(":").map(Number),
    ],
    recurrenceRule: isRepeating ? `FREQ=${repeatInterval};` : undefined,
    exdate: excludedDates
      ? excludedDates.map((date) => [
          new Date(date).getUTCFullYear(),
          new Date(date).getUTCMonth() + 1,
          new Date(date).getUTCDate(),
        ])
      : undefined,
  };

  return event;
}

export function createICS(events) {
  let { error, value } = createEvents(events);

  if (error) {
    throw new Error(error);
  }

  return value;
}
