import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/user/calendars");
}
