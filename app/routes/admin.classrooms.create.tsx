import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { zfd } from "zod-form-data";

import { prisma } from "~/database.server";

import { z } from "zod";
import { authenticator } from "~/services/auth.server";
let CreateClassroomSchema = zfd.formData({
  building: z.string(),
  capacity: z.string(),
  name: z.string().refine(async (name) => {
    let classroom = await prisma.classroom.findUnique({
      where: {
        name,
      },
    });

    return Boolean(!classroom);
  }, "Classroom with this name already exists."),
  equipment: z.string(),
});

export type ActionData = typeof action;

export async function action(args: ActionFunctionArgs) {
  let user = await authenticator.isAuthenticated(args.request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (!user.profile.isAdmin) {
    return redirect("/");
  }

  try {
    let formData = await args.request.formData();
    let data = await CreateClassroomSchema.parseAsync(formData);

    await prisma.classroom.create({
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
    message: "Classroom created successfully.",
  });
}
