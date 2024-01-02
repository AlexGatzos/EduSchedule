import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export async function loader(args: LoaderFunctionArgs) {
  await authenticator.authenticate("ihu", args.request, {
    successRedirect: "/?index",
  });
}
