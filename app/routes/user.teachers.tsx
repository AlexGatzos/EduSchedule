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
import { useState } from "react";
import { ViewTeacherModal } from "~/components/view-teachers-modal";
import { authenticator } from "~/services/auth.server";
import { UserIcon } from "@heroicons/react/24/solid";

export async function loader({ request }: LoaderFunctionArgs) {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  let teachers = await prisma.teacher.findMany({
    include: {
      courses: {
        select: {
          course: true,
        },
      },
    },
  });

  let teacherByName = teachers.reduce(
    (acc, teacher) => {
      if (teacher.fullName in acc) {
        acc[teacher.fullName].push(teacher);
      } else {
        acc[teacher.fullName] = [teacher];
      }
      return acc;
    },
    {} as Record<string, typeof teachers>,
  );

  let allTeachers = Object.entries(teacherByName).map(
    ([fullName, teachers]) => {
      return {
        id: fullName,
        fullName,
        teachers,
      };
    },
  );

  return json({ allTeachers, teachers });
}

export default function Teacher() {
  let { allTeachers, teachers } = useLoaderData<typeof loader>();

  let [teacherId, setTeacherId] = useState<number | null>(null);

  let selectedTeacher = teacherId
    ? teachers.find((c) => c.id === teacherId)
    : null;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <Heading className="text-2xl font-bold">Teachers</Heading>
          <div className="flex items-center gap-2"></div>
        </div>
        <ListBox className="flex flex-col gap-4" items={allTeachers}>
          {(teacher) => (
            <Section
              className="flex flex-col divide-y overflow-hidden rounded border"
              key={teacher.id}
            >
              <Header className="flex items-center gap-2 bg-indigo-50 px-2 py-3 text-lg font-semibold text-indigo-700">
                <UserIcon className="w-5" /> {teacher.fullName}
              </Header>

              <Collection items={teacher.teachers}>
                {(teacher) => (
                  <ListBoxItem
                    className="flex items-center justify-between"
                    key={teacher.id}
                  >
                    <div className="flex w-full flex-col divide-y">
                      {teacher.courses.map((course) => (
                        <div className="px-8 py-2" key={course.course.name}>
                          <span>{course.course.name}</span>
                          {/* Render other course details as needed */}
                        </div>
                      ))}
                    </div>
                  </ListBoxItem>
                )}
              </Collection>
            </Section>
          )}
        </ListBox>
      </div>

      {selectedTeacher && (
        <ViewTeacherModal
          isOpen={teacherId !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setTeacherId(null);
            }
          }}
          teacher={selectedTeacher}
        />
      )}
    </>
  );
}
