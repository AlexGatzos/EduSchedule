import { prisma } from "~/database.server";
import {
  addDays,
  addWeeks,
  isBefore,
  isEqual,
  differenceInDays,
  formatISO,
} from "date-fns";
import type { Prisma } from "@prisma/client";

type Event = Pick<
  Prisma.EventCreateInput,
  "startDate" | "endDate" | "startTime" | "endTime" | "repeatInterval" | "name"
>;

interface CheckRoomTimeParams {
  id?: number;
  room: string | number;
  startTime: string;
  endTime: string;
  repeatInterval: string;
  startDate: Date;
  endDate: Date;
}

async function checkForValidRoomTime(
  params: CheckRoomTimeParams,
): Promise<boolean> {
  let { room, startTime, endTime, repeatInterval, startDate, endDate } = params;
  let classroomId = typeof room === "string" ? parseInt(room, 10) : room;

  let existingEvents = await prisma.event.findMany({
    where: {
      AND: [
        {
          classroomId,
        },
        {
          id: {
            not: params.id,
          },
        },
      ],
    },
  });

  let days = differenceInDays(endDate, startDate);

  let daysTable = Array.from({ length: days + 1 }, (_, i) => {
    let currentDate = addDays(startDate, i);
    return {
      date: currentDate,
      events: [],
    } as {
      date: Date;
      events: Event[];
    };
  });

  function generateRepeatingDates(event: Event) {
    let dates = [];
    let startDate = event.startDate;
    let endDate = event.endDate;
    let currentDate = startDate;

    if (event.repeatInterval === "none") {
      dates.push(startDate);
    } else if (event.repeatInterval === "daily") {
      while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
        dates.push(currentDate);
        currentDate = addDays(currentDate, 1);
      }
    } else if (event.repeatInterval === "weekly") {
      while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
        dates.push(currentDate);
        currentDate = addWeeks(currentDate, 1);
      }
    }

    return dates;
  }

  function updateDays(event: Event) {
    let eventDates = generateRepeatingDates(event);

    daysTable.forEach((day) => {
      if (
        eventDates.some((date) => {
          let formatedDate = formatISO(date, { representation: "date" });
          let formatedDayDate = formatISO(day.date, { representation: "date" });
          return isEqual(formatedDate, formatedDayDate);
        })
      ) {
        day.events.push(event);
      }
    });
  }

  existingEvents.forEach((event) => {
    updateDays(event);
  });

  updateDays({
    startDate,
    endDate,
    startTime,
    endTime,
    repeatInterval,
  });

  daysTable.forEach((day) => {
    // Check each event with all other events on the same day for overlapping times
    day.events.forEach((event, index, events) => {
      let overlappingEvents = events.filter((e, i) => {
        if (i === index) {
          return false;
        }

        let isBooked =
          e.startTime < event.endTime && e.endTime > event.startTime;

        return isBooked;
      });

      if (overlappingEvents.length > 0) {
        let message = overlappingEvents
          .map((e) => `${e.name} στις ${e.startTime} - ${e.endTime}`)
          .join(", ");

        throw new Error(
          `Η αίθουσα δεν είναι διαθέσιμη κατά τη συγκεκριμένη χρονική περίοδο. Είναι κρατημενη για το event: ${message}`,
        );
      }
    });
  });

  return true;
}

export { checkForValidRoomTime };

// in-source test suites
if (import.meta.vitest) {
  let { describe, test, expect, beforeAll, afterAll } = import.meta.vitest;

  describe("checkForValidRoomTime", () => {
    beforeAll(async () => {
      await prisma.event.createMany({
        data: [
          {
            id: 1000,
            classroomId: 1,
            repeatInterval: "none",
            startDate: new Date("2024-04-01"),
            endDate: new Date("2024-04-01"),
            startTime: "08:00:00",
            endTime: "09:00:00",
            courseId: 1,
            isRepeating: false,
            name: "Event1",
            repeatDays: "",
          },
          {
            id: 1001,
            classroomId: 2,
            repeatInterval: "daily",
            startDate: new Date("2024-04-01"),
            endDate: new Date("2024-04-30"),
            startTime: "10:00:00",
            endTime: "11:00:00",
            courseId: 1,
            isRepeating: true,
            name: "Event2",
            repeatDays: "",
          },
          {
            id: 1002,
            classroomId: 3,
            repeatInterval: "weekly",
            startDate: new Date("2024-04-01"),
            endDate: new Date("2024-04-30"),
            startTime: "12:00:00",
            endTime: "13:00:00",
            courseId: 1,
            isRepeating: true,
            name: "Event3",
            repeatDays: "1",
          },
        ],
      });
    });

    afterAll(async () => {
      await prisma.event.deleteMany({
        where: {
          id: {
            in: [1000, 1001, 1002, 1003, 1004],
          },
        },
      });
    });

    describe("Event1: None | 01/04 - 01/04 | 08:00:00 - 09:00:00", () => {
      let freeEvents = [
        {
          room: "1",
          startTime: "09:00:00",
          endTime: "10:00:00",
          repeatInterval: "none",
          startDate: new Date("2024-04-01"),
          endDate: new Date("2024-04-01"),
        },
        {
          room: "1",
          startTime: "08:00:00",
          endTime: "09:00:00",
          repeatInterval: "none",
          startDate: new Date("2024-04-02"),
          endDate: new Date("2024-04-02"),
        },
        {
          room: "1",
          startTime: "11:00:00",
          endTime: "12:00:00",
          repeatInterval: "daily",
          startDate: new Date("2024-03-25"),
          endDate: new Date("2024-04-14"),
        },
        {
          room: "1",
          startTime: "11:00:00",
          endTime: "12:00:00",
          repeatInterval: "weekly",
          startDate: new Date("2024-03-25"),
          endDate: new Date("2024-04-014"),
        },
      ];

      describe("Free", () => {
        freeEvents.forEach((event) => {
          test(`${event.repeatInterval} | ${event.startDate.getDate()}/${event.startDate.getMonth() + 1} - ${event.endDate.getDate()}/${event.endDate.getMonth() + 1} | ${event.startTime} - ${event.endTime}`, async () => {
            await expect(checkForValidRoomTime(event)).resolves.toBe(true);
          });
        });
      });

      let bookedEvents = [
        {
          room: "1",
          startTime: "08:00:00",
          endTime: "09:00:00",
          repeatInterval: "none",
          startDate: new Date("2024-04-01"),
          endDate: new Date("2024-04-01"),
        },
        {
          room: "1",
          startTime: "08:00:00",
          endTime: "10:00:00",
          repeatInterval: "none",
          startDate: new Date("2024-04-01"),
          endDate: new Date("2024-04-01"),
        },
        {
          room: "1",
          startTime: "07:00:00",
          endTime: "11:00:00",
          repeatInterval: "none",
          startDate: new Date("2024-04-01"),
          endDate: new Date("2024-04-01"),
        },
        {
          room: "1",
          startTime: "07:00:00",
          endTime: "11:00:00",
          repeatInterval: "daily",
          startDate: new Date("2024-03-25"),
          endDate: new Date("2024-04-03"),
        },
        {
          room: "1",
          startTime: "08:00:00",
          endTime: "09:00:00",
          repeatInterval: "daily",
          startDate: new Date("2024-04-01"),
          endDate: new Date("2024-04-03"),
        },
        {
          room: "1",
          startTime: "08:00:00",
          endTime: "09:00:00",
          repeatInterval: "weekly",
          startDate: new Date("2024-03-25"),
          endDate: new Date("2024-04-03"),
        },
        {
          room: "1",
          startTime: "07:00:00",
          endTime: "10:00:00",
          repeatInterval: "weekly",
          startDate: new Date("2024-03-25"),
          endDate: new Date("2024-04-03"),
        },
      ];

      describe("Booked", () => {
        bookedEvents.forEach((event) => {
          test(`${event.repeatInterval} | ${event.startDate.getDate()}/${event.startDate.getMonth() + 1} - ${event.endDate.getDate()}/${event.endDate.getMonth() + 1} | ${event.startTime} - ${event.endTime}`, async () => {
            await expect(checkForValidRoomTime(event)).rejects.toThrowError(
              "Η αίθουσα δεν είναι διαθέσιμη κατά τη συγκεκριμένη χρονική περίοδο",
            );
          });
        });
      });
    });

    describe("Event2: Daily | 01/04 - 03/04 | 10:00:00 - 11:00:00", () => {
      describe("Free", () => {
        let freeEvents = [
          {
            room: "2",
            startTime: "9:00:00",
            endTime: "10:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-04-11"),
            endDate: new Date("2024-04-11"),
          },
          {
            room: "2",
            startTime: "10:00:00",
            endTime: "11:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-05-01"),
            endDate: new Date("2024-05-01"),
          },
          {
            room: "2",
            startTime: "9:00:00",
            endTime: "10:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-04-1"),
            endDate: new Date("2024-04-30"),
          },
          {
            room: "2",
            startTime: "10:00:00",
            endTime: "11:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-05-1"),
            endDate: new Date("2024-05-30"),
          },
          {
            room: "2",
            startTime: "11:00:00",
            endTime: "12:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-04-5"),
            endDate: new Date("2024-05-30"),
          },
          {
            room: "2",
            startTime: "9:00:00",
            endTime: "10:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-03-1"),
            endDate: new Date("2024-04-30"),
          },
          {
            room: "2",
            startTime: "11:00:00",
            endTime: "12:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-04-1"),
            endDate: new Date("2024-04-30"),
          },
          {
            room: "2",
            startTime: "10:00:00",
            endTime: "11:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-05-1"),
            endDate: new Date("2024-05-30"),
          },
        ];

        freeEvents.forEach((event) => {
          test(`${event.repeatInterval} | ${event.startDate.getDate()}/${event.startDate.getMonth() + 1} - ${event.endDate.getDate()}/${event.endDate.getMonth() + 1} | ${event.startTime} - ${event.endTime}`, async () => {
            await expect(checkForValidRoomTime(event)).resolves.toBe(true);
          });
        });
      });

      describe("Booked", () => {
        let bookedEvents = [
          {
            room: "2",
            startTime: "10:00:00",
            endTime: "11:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-04-03"),
            endDate: new Date("2024-04-03"),
          },
          {
            room: "2",
            startTime: "09:00:00",
            endTime: "11:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-04-03"),
            endDate: new Date("2024-04-03"),
          },
          {
            room: "2",
            startTime: "10:00:00",
            endTime: "11:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-03-03"),
            endDate: new Date("2024-04-09"),
          },
          {
            room: "2",
            startTime: "10:00:00",
            endTime: "11:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-04-03"),
            endDate: new Date("2024-05-09"),
          },
          {
            room: "2",
            startTime: "09:00:00",
            endTime: "11:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-03-03"),
            endDate: new Date("2024-04-09"),
          },
          {
            room: "2",
            startTime: "10:00:00",
            endTime: "11:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-03-18"),
            endDate: new Date("2024-04-09"),
          },
          {
            room: "2",
            startTime: "09:00:00",
            endTime: "11:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-03-26"),
            endDate: new Date("2024-04-09"),
          },
        ];

        bookedEvents.forEach((event) => {
          test(`${event.repeatInterval} | ${event.startDate.getDate()}/${event.startDate.getMonth() + 1} - ${event.endDate.getDate()}/${event.endDate.getMonth() + 1} | ${event.startTime} - ${event.endTime}`, async () => {
            await expect(checkForValidRoomTime(event)).rejects.toThrowError(
              "Η αίθουσα δεν είναι διαθέσιμη κατά τη συγκεκριμένη χρονική περίοδο",
            );
          });
        });
      });
    });

    describe("Event3: Weekly | 01/04 - 03/04 | 12:00:00 - 13:00:00", () => {
      describe("Free", () => {
        let freeEvents = [
          {
            room: "3",
            startTime: "12:00:00",
            endTime: "13:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-04-02"),
            endDate: new Date("2024-04-02"),
          },
          {
            room: "3",
            startTime: "9:00:00",
            endTime: "10:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-04-01"),
            endDate: new Date("2024-04-01"),
          },
          {
            room: "3",
            startTime: "12:00:00",
            endTime: "13:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-05-06"),
            endDate: new Date("2024-05-06"),
          },
          {
            room: "3",
            startTime: "12:00:00",
            endTime: "13:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-03-25"),
            endDate: new Date("2024-03-25"),
          },
          {
            room: "3",
            startTime: "12:00:00",
            endTime: "13:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-04-02"),
            endDate: new Date("2024-04-05"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "12:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-04-01"),
            endDate: new Date("2024-04-05"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "12:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-03-01"),
            endDate: new Date("2024-04-05"),
          },
          {
            room: "3",
            startTime: "12:00:00",
            endTime: "13:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-04-02"),
            endDate: new Date("2024-04-30"),
          },
          {
            room: "3",
            startTime: "12:00:00",
            endTime: "13:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-03-27"),
            endDate: new Date("2024-04-30"),
          },
        ];

        freeEvents.forEach((event) => {
          test(`${event.repeatInterval} | ${event.startDate.getDate()}/${event.startDate.getMonth() + 1} - ${event.endDate.getDate()}/${event.endDate.getMonth() + 1} | ${event.startTime} - ${event.endTime}`, async () => {
            await expect(checkForValidRoomTime(event)).resolves.toBe(true);
          });
        });
      });

      describe("Booked", () => {
        let bookedEvents = [
          {
            room: "3",
            startTime: "12:00:00",
            endTime: "13:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-04-01"),
            endDate: new Date("2024-04-01"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "13:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-04-08"),
            endDate: new Date("2024-04-08"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "13:00:00",
            repeatInterval: "none",
            startDate: new Date("2024-04-22"),
            endDate: new Date("2024-04-22"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "13:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-04-04"),
            endDate: new Date("2024-04-11"),
          },
          {
            room: "3",
            startTime: "12:00:00",
            endTime: "13:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-04-04"),
            endDate: new Date("2024-04-11"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "13:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-03-26"),
            endDate: new Date("2024-04-11"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "13:00:00",
            repeatInterval: "daily",
            startDate: new Date("2024-04-04"),
            endDate: new Date("2024-05-11"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "13:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-04-08"),
            endDate: new Date("2024-04-30"),
          },
          {
            room: "3",
            startTime: "12:00:00",
            endTime: "13:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-04-08"),
            endDate: new Date("2024-04-30"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "13:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-03-25"),
            endDate: new Date("2024-04-30"),
          },
          {
            room: "3",
            startTime: "10:00:00",
            endTime: "13:00:00",
            repeatInterval: "weekly",
            startDate: new Date("2024-04-08"),
            endDate: new Date("2024-05-30"),
          },
        ];

        bookedEvents.forEach((event) => {
          test(`${event.repeatInterval} | ${event.startDate.getDate()}/${event.startDate.getMonth() + 1} - ${event.endDate.getDate()}/${event.endDate.getMonth() + 1} | ${event.startTime} - ${event.endTime}`, async () => {
            await expect(checkForValidRoomTime(event)).rejects.toThrowError(
              "Η αίθουσα δεν είναι διαθέσιμη κατά τη συγκεκριμένη χρονική περίοδο",
            );
          });
        });
      });
    });

    describe("Handles existing event", () => {
      let event = {
        room: "1",
        startTime: "08:00:00",
        endTime: "09:00:00",
        repeatInterval: "none",
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-04-01"),
        id: 1000,
      };

      test("Same time", async () => {
        await expect(checkForValidRoomTime(event)).resolves.toBe(true);
      });

      test("Different time", async () => {
        await expect(
          checkForValidRoomTime({
            ...event,
            startTime: "08:30:00",
            endTime: "10:00:00",
          }),
        ).resolves.toBe(true);
      });
    });
  });
}
