import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/database.server";
import { authenticator } from "~/services/auth.server";

let ParamsSchema = z.object({
  id: z.coerce.number(),
  date: z.string(),
});

export async function action(args: ActionFunctionArgs) {
  let user = await authenticator.isAuthenticated(args.request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (user.profile.eduPersonAffiliation === "staff" || user.profile.isAdmin) {
    let params = ParamsSchema.parse(args.params);

    let event = await prisma.event.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    let excludedDates = [];
    try {
      excludedDates = JSON.parse(event.excludedDates || "[]");
    } catch (error) {
      console.error(error);
    }

    await prisma.event.update({
      where: {
        id: params.id,
      },
      data: {
        excludedDates: JSON.stringify(excludedDates.concat(params.date)),
      },
    });

    return {
      message: "Success",
    };
  }

  return {
    error: "Cannot delete event.",
  };
}

export type ActionData = typeof action;
