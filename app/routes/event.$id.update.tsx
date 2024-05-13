import { parseZonedDateTime } from "@internationalized/date";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";

let UpdateEventSchema = zfd.formData({
  name: z.string().optional(),
  courseId: zfd.numeric(),
  classroomId: zfd.numeric(),
  repeat: z.enum(["none", "daily", "weekly", "monthly", "yearly"]),
  startTime: z.string(),
  endTime: z.string(),
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
});

let ParamsSchema = z.object({
  id: z.coerce.number(),
});

export async function action(args: ActionFunctionArgs) {
  let user = await authenticator.isAuthenticated(args.request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (user.profile.eduPersonAffiliation === "staff" || user.profile.isAdmin) {
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

    return redirect("/?index");
  }

  return redirect("/");
}
