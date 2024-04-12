import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";

let ParamsSchema = z.object({
  id: z.coerce.number(),
});

export async function action(args: ActionFunctionArgs) {
  let user = await authenticator.isAuthenticated(args.request);

  if (!user) {
    return redirect("/auth/login");
  }

  let params = ParamsSchema.parse(args.params);

  await prisma.calendars.delete({
    where: {
      id: params.id,
    },
  });

  return redirect("/user/?index");
}
