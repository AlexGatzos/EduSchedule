import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { z } from "zod";
import { zfd } from "zod-form-data";
import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";

let UpdateCourseSchema = zfd.formData({
  course_id: z.coerce.number(),
  type: z.string(),
  name: z.string(),
  semester: z.string(),
  teacherIds: z.string(),
});

let ParamsSchema = z.object({
  id: z.coerce.number(),
});

export async function action(args: ActionFunctionArgs) {
  let user = await authenticator.isAuthenticated(args.request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (!user.profile.isAdmin) {
    return redirect("/");
  }

  let formData = await args.request.formData();
  let params = ParamsSchema.parse(args.params);

  let course = await prisma.course.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  let { teacherIds, ...data } = UpdateCourseSchema.parse(formData);
  await prisma.courseTeachers.deleteMany({
    where: {
      courseId: course.course_id,
    },
  });

  await prisma.course.update({
    where: {
      id: params.id,
    },
    data: {
      ...data,
      teachers: {
        connectOrCreate: teacherIds.split(",").map((id) => ({
          create: {
            teacher: {
              connect: {
                teacher_id: parseInt(id),
              },
            },
          },
          where: {
            courseId: course.course_id,
            teacherId: parseInt(id),
            courseId_teacherId: {
              courseId: course.course_id,
              teacherId: parseInt(id),
            },
          },
        })),
      },
    },
  });

  return redirect("/admin/courses");
}
