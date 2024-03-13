import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { zfd } from "zod-form-data";

import { prisma } from "~/database.server";

import { z } from "zod";
import { authenticator } from "~/services/auth.server";
let CreateTeacherSchema = zfd.formData({
  fullName: z.string(),
  role: z.string(),
  teacher_id: z.coerce.number(),
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
  let data = CreateTeacherSchema.parse(formData);

  await prisma.teacher.create({
    data,
  });

  return redirect("/admin/teachers");
}
