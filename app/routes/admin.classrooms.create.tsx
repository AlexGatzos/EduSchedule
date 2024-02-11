import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { zfd } from "zod-form-data";

import { prisma } from "~/database.server";

import { z } from "zod";
import { authenticator } from "~/services/auth.server";
let CreateClassroomSchema = zfd.formData({
  building: z.string(),
  capacity: z.string(),
  name: z.string(),
  equipment: z.string(),
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
  let data = CreateClassroomSchema.parse(formData);

  await prisma.classroom.create({
    data,
  });

  return redirect("/admin/classrooms");
}
