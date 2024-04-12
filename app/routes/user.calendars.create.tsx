import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { zfd } from "zod-form-data";
import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";
import { z } from "zod";

let CreateCalendarSchema = zfd.formData({
  name: z.string(),
  courseIds: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  let formData = await request.formData();
  let data = CreateCalendarSchema.parse(formData);

  await prisma.calendars.create({
    data: {
      userId: user.profile.uid,
      name: data.name,
      courseIds: data.courseIds,
    },
  });

  return redirect("/user/calendars");
}
