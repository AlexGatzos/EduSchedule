import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export async function action(args: LoaderFunctionArgs) {
  await authenticator.logout(args.request, {
    redirectTo: "/?index",
  });
}
