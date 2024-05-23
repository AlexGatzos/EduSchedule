import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { prisma } from "~/database.server";
import { checkForValidRoomTime } from "~/services/validation";

let CreateEventSchema = zfd
  .formData({
    name: z.string().optional(),
    courseId: z.coerce.number(),
    classroomId: z.coerce.number(),
    repeat: z.enum(["none", "daily", "weekly", "monthly", "yearly"]),
    startTime: z.string().refine((value) => {
      let [hours, minutes] = value.split(":").map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, "Invalid time format"),
    endTime: z.string().refine((value) => {
      let [hours, minutes] = value.split(":").map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, "Invalid time format"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .superRefine((values, context) => {
    if (values.startTime > values.endTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time should be before end time",
        path: ["startTime"],
      });
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time should be after end time",
        path: ["endTime"],
      });
    }

    if (values.startDate > values.endDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date should be before end date",
        path: ["startDate"],
      });
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date should be after start date",
        path: ["endDate"],
      });
    }
  });

export type ActionData = typeof action;

export async function action(args: ActionFunctionArgs) {
  try {
    let formData = await args.request.formData();
    let data = CreateEventSchema.parse(formData);

    let course = await prisma.course.findUnique({
      where: {
        id: data.courseId,
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    let startTime = new Date(data.startDate);
    let [startHours, startMinutes] = data.startTime.split(":").map(Number);
    startTime.setHours(startHours);
    startTime.setMinutes(startMinutes);

    let endTime = new Date(data.startDate);
    let [endHours, endMinutes] = data.endTime.split(":").map(Number);
    endTime.setHours(endHours);
    endTime.setMinutes(endMinutes);

    let isRepeating = data.repeat === "none" ? false : true;

    console.log({
      data,
    });

    await checkForValidRoomTime({
      endDate: data.endDate,
      endTime: data.endTime,
      repeatInterval: data.repeat,
      room: data.classroomId,
      startDate: data.startDate,
      startTime: data.startTime,
    });

    await prisma.event.create({
      data: {
        name: data.name || course.name,
        startTime: data.startTime,
        endTime: data.endTime,
        isRepeating: isRepeating,
        repeatDays: data.repeat,
        repeatInterval: data.repeat,
        startDate: data.startDate,
        endDate: data.endDate,
        course: {
          connect: {
            id: course.id,
          },
        },
        classroom: {
          connect: {
            id: data.classroomId,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({
        errors: error.errors.reduce(
          (errors, error) => {
            return {
              ...errors,
              [error.path.join(".")]: error.message,
            };
          },
          {} as Record<string, string>,
        ),
      });
    }

    let errorMessage =
      error instanceof Error
        ? error.message
        : `An error occurred while creating the event. ${error}`;
    return json({
      errors: {
        form: errorMessage,
      },
    });
  }

  return json({
    message: "Event created successfully.",
  });
}
