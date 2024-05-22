import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { zfd } from "zod-form-data";

import { prisma } from "~/database.server";

import { z } from "zod";
import { authenticator } from "~/services/auth.server";

let CreateTeacherSchema = zfd.formData({
  fullName: z.string(),
  role: z.string(),
  teacher_id: z.coerce.number().refine(async (teacher_id) => {
    let teacher = await prisma.teacher.findUnique({
      where: {
        teacher_id,
      },
    });

    return Boolean(!teacher);
  }, "Teacher ID already exists."),
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
    let data = await CreateTeacherSchema.parseAsync(formData);
    await prisma.teacher.create({
      data,
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
