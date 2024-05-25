import { parseZonedDateTime } from "@internationalized/date";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";
import { checkForValidRoomTime } from "~/services/validation";

let UpdateEventSchema = zfd
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
    startDate: z.string().transform((value) => {
      if (typeof value !== "string") {
        throw new Error("Invalid date format");
      }

      return parseZonedDateTime(value).toDate();
    }),
    endDate: z.string().transform((value) => {
      if (typeof value !== "string") {
        throw new Error("Invalid date format");
      }

      return parseZonedDateTime(value).toDate();
    }),
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

let ParamsSchema = z.object({
  id: z.coerce.number(),
});

export async function action(args: ActionFunctionArgs) {
  let user = await authenticator.isAuthenticated(args.request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (
    !(user.profile.eduPersonAffiliation === "staff") &&
    !user.profile.isAdmin
  ) {
    return redirect("/");
  }

  try {
    let formData = await args.request.formData();
    let params = ParamsSchema.parse(args.params);

    let data = UpdateEventSchema.parse(formData);

    let course = await prisma.course.findUnique({
      where: {
        id: data.courseId,
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    let isRepeating = data.repeat === "none" ? false : true;

    await checkForValidRoomTime({
      id: params.id,
      endDate: data.endDate,
      endTime: data.endTime,
      repeatInterval: data.repeat,
      room: data.classroomId,
      startDate: data.startDate,
      startTime: data.startTime,
    });

    await prisma.event.update({
      where: {
        id: params.id,
      },
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
            let path = error.path.join(".");
            errors[path] = error.message;
            return errors;
          },
          {} as Record<string, string>,
        ),
      });
    }

    return json({
      errors: {
        form: `${error}`,
      },
    });
  }

  return json({ success: true });
}
