import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  CloudArrowUpIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno

import { prisma } from "~/database.server";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Button,
  Heading,
  Section,
  Collection,
  ListBox,
  ListBoxItem,
  Header,
  FileTrigger,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { useState } from "react";
import { CreateCourseModal } from "~/components/create-course-modal";
import { EditCourseModal } from "~/components/edit-course-modal";
import { authenticator } from "~/services/auth.server";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { ExampleTable } from "~/components/csv-example-table";

export async function loader({ request }: LoaderFunctionArgs) {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (!user.profile.isAdmin) {
    return redirect("/");
  }

  let teachers = await prisma.teacher.findMany();
  let courses = await prisma.course.findMany({
    include: {
      teachers: {
        select: {
          teacher: true,
        },
      },
    },
  });

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

  return json({ allCourses, courses, teachers });
}

export default function Courses() {
  let { allCourses, courses, teachers } = useLoaderData<typeof loader>();

  let [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  let [courseId, setCourseId] = useState<number | null>(null);
  let uploadCSVFetcher = useFetcher();
  let deleteAllCoursesFetcher = useFetcher();
  let deleteCourseFetcher = useFetcher();

  let selectedCourse = courseId ? courses.find((c) => c.id === courseId) : null;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <Heading className="text-2xl font-bold">Courses</Heading>
          <div className="flex items-center gap-2">
            <Button
              slot={null}
              onPress={() => setIsNewCourseModalOpen(true)}
              type="button"
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="w-4" /> Add Course
            </Button>
            <DialogTrigger>
              <Button
                slot={null}
                className="flex items-center gap-2 rounded-md bg-zinc-500 px-3 py-2 text-sm font-semibold text-white shadow-sm aria-disabled:opacity-25 hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
              >
                <CloudArrowUpIcon className="w-4" /> Upload CSV
              </Button>
              <ModalOverlay
                isDismissable
                className={({ isEntering, isExiting }) => `
                          fixed inset-0 z-10 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur
                          ${
                            isEntering
                              ? "duration-300 ease-out animate-in fade-in"
                              : ""
                          }
                          ${
                            isExiting
                              ? "duration-200 ease-in animate-out fade-out"
                              : ""
                          }
                        `}
              >
                <Modal
                  className={({ isEntering, isExiting }) => `
                            w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl
                            ${
                              isEntering
                                ? "duration-300 ease-out animate-in zoom-in-95"
                                : ""
                            }
                            ${
                              isExiting
                                ? "duration-200 ease-in animate-out zoom-out-95"
                                : ""
                            }
                          `}
                >
                  <Dialog
                    role="alertdialog"
                    className="relative flex max-h-[80vh] flex-col gap-4 outline-none"
                  >
                    {({ close }) => (
                      <>
                        <Heading
                          slot="title"
                          className="my-0 text-xl font-semibold leading-6 text-slate-700"
                        >
                          Upload CSV
                        </Heading>

                        <p>
                          Upload a CSV file to add multiple courses at once. The
                          CSV should have the following columns:
                        </p>
                        <ExampleTable
                          columns={[
                            "course_id",
                            "type",
                            "desc",
                            "ex",
                            "teacherId",
                          ]}
                          examples={[
                            ["123", "Θ", "Περιγραφή", "Εξάμηνο", "1"],
                            ["124", "Θ", "Περιγραφή", "Εξάμηνο", "2"],
                          ]}
                        />

                        <p className="flex gap-1 text-sm">
                          <InformationCircleIcon className="w-5" /> The CSV file
                          must be separated by a semicolon{" "}
                          <pre className="rounded bg-zinc-200 px-1 text-zinc-900">
                            ;
                          </pre>
                        </p>

                        <FileTrigger
                          acceptedFileTypes={["text/csv"]}
                          onSelect={(files) => {
                            if (!files) return;

                            let formData = new FormData();
                            formData.append("file", files[0]);

                            uploadCSVFetcher.submit(formData, {
                              method: "POST",
                              action: "/admin/courses/upload",
                              encType: "multipart/form-data",
                            });
                          }}
                        >
                          <Button
                            isDisabled={uploadCSVFetcher.state !== "idle"}
                            className={`${
                              uploadCSVFetcher.state !== "idle" &&
                              "animate-pulse"
                            } flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                          >
                            <CloudArrowUpIcon className="w-4" /> Upload CSV
                          </Button>
                        </FileTrigger>
                      </>
                    )}
                  </Dialog>
                </Modal>
              </ModalOverlay>
            </DialogTrigger>
            <Button
              onPress={() => {
                deleteAllCoursesFetcher.submit(null, {
                  method: "DELETE",
                  action: "/admin/courses/delete",
                });
              }}
              className="flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
            >
              <TrashIcon className="w-4" /> Delete All
            </Button>
          </div>
        </div>
        <ListBox
          className="rounded border shadow-2xl shadow-indigo-400"
          items={allCourses}
        >
          {(semesterWithCourses) => (
            <Section
              className="flex flex-col divide-y border"
              key={semesterWithCourses.id}
            >
              <Header className="px-2 py-4 text-lg font-semibold">
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
                    <div className="flex items-center gap-2">
                      <Button onPress={() => setCourseId(course.id)}>
                        <PencilSquareIcon className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button
                        onPress={() => {
                          deleteCourseFetcher.submit(null, {
                            method: "DELETE",
                            action: `/admin/courses/${course.id}/delete`,
                          });
                        }}
                      >
                        <TrashIcon className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </ListBoxItem>
                )}
              </Collection>
            </Section>
          )}
        </ListBox>
      </div>

      <CreateCourseModal
        isOpen={isNewCourseModalOpen}
        onOpenChange={setIsNewCourseModalOpen}
        teachers={teachers}
      />

      {selectedCourse && (
        <EditCourseModal
          isOpen={courseId !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setCourseId(null);
            }
          }}
          course={selectedCourse}
          teachers={teachers}
        />
      )}
    </>
  );
}
