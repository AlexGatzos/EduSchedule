import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";

import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";

let ParamsSchema = z.object({
  id: z.coerce.number(),
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (!user.profile.isAdmin) {
    return redirect("/");
  }

  let { id } = ParamsSchema.parse(params);

  await prisma.classroom.delete({
    where: {
      id,
    },
  });

  return null;
};
