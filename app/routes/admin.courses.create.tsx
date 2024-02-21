import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { zfd } from "zod-form-data";

import { prisma } from "~/database.server";

import { z } from "zod";
import { authenticator } from "~/services/auth.server";

let CreateCourseSchema = zfd.formData({
  course_id: z.coerce.number(),
  type: z.string(),
  name: z.string(),
  semester: z.string(),
  teacherIds: z.string(),
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

  let { teacherIds, ...data } = CreateCourseSchema.parse(formData);

  await prisma.course.create({
    data: {
      ...data,
      teachers: {
        create: teacherIds.split(",").map((id) => ({
          teacher: {
            connect: {
              teacher_id: parseInt(id),
            },
          },
        })),
      },
    },
  });

  return redirect("/admin/courses");
}
