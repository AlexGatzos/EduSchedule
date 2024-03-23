import { Form } from "@remix-run/react";
import { type ActionFunctionArgs } from "@remix-run/server-runtime";
import { prisma } from "~/database.server";

export async function action() {
  await prisma.event.create({
    data: {
      name: "Event 1",
      description: "Event 1 description",
      startTime: new Date(),
      endTime: new Date(),
      // course: {
      //     connect: {

      //     }
      // }
    },
  });
}

export async function loader() {}

export default function Event() {
  return (
    <Form method="POST">
      <input type="text" name="name" />
      <input type="text" name="description" />
      <input type="datetime-local" name="startTime" />
      <input type="datetime-local" name="endTime" />
      <input type="submit" />
    </Form>
  );
}
