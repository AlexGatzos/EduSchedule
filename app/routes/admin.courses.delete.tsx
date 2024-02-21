import { redirect, type ActionFunctionArgs } from "@remix-run/node";

import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (!user.profile.isAdmin) {
    return redirect("/");
  }

  await prisma.course.deleteMany();

  return null;
};
