import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { zfd } from "zod-form-data";

import { prisma } from "~/database.server";

import { z } from "zod";
import { authenticator } from "~/services/auth.server";

let CreateCourseSchema = zfd.formData({
  course_id: z.coerce.number().refine(async (course_id) => {
    let course = await prisma.course.findUnique({
      where: {
        course_id,
      },
    });

    return Boolean(!course);
  }, "Course ID already exists."),
  type: z.string(),
  name: z.string(),
  semester: z.string(),
  teacherIds: z.string(),
});

export type ActionData = typeof action;

export async function action(args: ActionFunctionArgs) {
  let user = await authenticator.isAuthenticated(args.request);

  if (!user) {
    throw redirect("/auth/login");
  }

  if (!user.profile.isAdmin) {
    throw redirect("/");
  }

  try {
    let formData = await args.request.formData();
    let { teacherIds, ...data } = await CreateCourseSchema.parseAsync(formData);

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({
        errors: error.errors.reduce((errors, error) => {
          return {
            ...errors,
            [error.path.join(".")]: error.message,
          };
        }, {}),
      });
    }
  }

  return json({
    message: "Teacher created successfully.",
  });
}
