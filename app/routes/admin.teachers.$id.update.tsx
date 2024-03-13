import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";

let UpdateTeacherSchema = zfd.formData({
  fullName: z.string(),
  role: z.string(),
  teacher_id: z.coerce.number(),
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

  let data = UpdateTeacherSchema.parse(formData);

  await prisma.teacher.update({
    where: {
      id: params.id,
    },
    data,
  });

  return redirect("/admin/teachers");
}
