import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno

import { prisma } from "~/database.server";
import { useLoaderData } from "@remix-run/react";
import {
  Heading,
  Section,
  Collection,
  ListBox,
  ListBoxItem,
  Header,
} from "react-aria-components";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  let courses = await prisma.course.findMany();

  let coursesBySemester = courses.reduce(
    (acc, course) => {
      if (course.semester in acc) {
        acc[course.semester].push(course);
      } else {
        acc[course.semester] = [course];
      }
      return acc;
    },
    {} as Record<string, typeof courses>,
  );

  let allCourses = Object.entries(coursesBySemester).map(
    ([semester, courses]) => {
      return {
        id: semester,
        semester,
        courses,
      };
    },
  );

  return json({ allCourses });
}

export default function Courses() {
  let { allCourses } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <Heading className="text-2xl font-bold">Courses</Heading>
          <div className="flex items-center gap-2"></div>
        </div>
        <ListBox className="flex flex-col gap-4" items={allCourses}>
          {(semesterWithCourses) => (
            <Section
              className="flex flex-col divide-y overflow-hidden rounded border"
              key={semesterWithCourses.id}
            >
              <Header className="bg-indigo-50 px-2 py-4 text-lg font-semibold text-indigo-500">
                Εξάμηνο {semesterWithCourses.semester}
              </Header>
              <Collection items={semesterWithCourses.courses}>
                {(course) => (
                  <ListBoxItem
                    className="flex items-center justify-between gap-2 px-2 py-3"
                    key={course.id}
                  >
                    <span className="flex-shrink-0 text-xs text-gray-800">
                      {course.type}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-gray-900">
                      {course.name}
                    </span>
                  </ListBoxItem>
                )}
              </Collection>
            </Section>
          )}
        </ListBox>
      </div>
    </>
  );
}
