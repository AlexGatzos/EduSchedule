import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  CloudArrowUpIcon,
  InformationCircleIcon,
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
  ListBox,
  ListBoxItem,
  FileTrigger,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { useState } from "react";
import { CreateEventModal } from "~/components/create-event-modal";
import { EditEventModal } from "~/components/edit-event-modal";
import { DeleteEventModal } from "~/components/delete-event-modal";
import { authenticator } from "~/services/auth.server";
import { ExampleTable } from "~/components/csv-example-table";

export async function loader({ request }: LoaderFunctionArgs) {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  if (!user.profile.isAdmin) {
    return redirect("/");
  }

  let events = await prisma.event.findMany();

  let courses = await prisma.course.findMany();

  let classrooms = await prisma.classroom.findMany();
  console.log({ classrooms });
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

  return json({
    allCourses,
    events,
    courses,
    classrooms,
    repeat: [
      {
        id: "none",
        name: "None",
      },
      {
        id: "daily",
        name: "Daily",
      },
      {
        id: "weekly",
        name: "Weekly",
      },
      {
        id: "monthly",
        name: "Monthly",
      },
      {
        id: "yearly",
        name: "Yearly",
      },
    ],
  });
}

export default function Courses() {
  let { allCourses, events, courses, classrooms, repeat } =
    useLoaderData<typeof loader>();

  console.log({
    classrooms,
  });

  let [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  let [isDeleteEventModalOpen, setIsDeleteEventModalOpen] = useState(false);
  let [eventid, setEventId] = useState<number | null>(null);
  let uploadCSVFetcher = useFetcher();
  let deleteAllCoursesFetcher = useFetcher();
  let deleteCourseFetcher = useFetcher();

  let selectedEvent = eventid ? events.find((c) => c.id === eventid) : null;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <Heading className="text-2xl font-bold">Events</Heading>
          <div className="flex items-center gap-2">
            <Button
              slot={null}
              onPress={() => setIsNewEventModalOpen(true)}
              type="button"
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="w-4" /> Add Event
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
                          Upload a CSV file to add multiple events at once. The
                          CSV should have the following columns:
                        </p>
                        <ExampleTable
                          columns={[
                            "name",
                            "startTime",
                            "endTime",
                            "isRepeating",
                            "repeatDays",
                            "repeatInterval",
                            "startDate",
                            "endDate",
                            "course_id",
                            "classroom_name",
                          ]}
                          examples={[
                            [
                              "Δομημένος Προγραμματισμός",
                              "10:00:00",
                              "12:00:00",
                              "true",
                              "daily",
                              "daily",
                              "2024-03-04",
                              "2024-03-31",
                              "1102",
                              "101",
                            ],
                            [
                              "Δομημένος Προγραμματισμός",
                              "10:00:00",
                              "12:00:00",
                              "true",
                              "daily",
                              "daily",
                              "2024-03-04",
                              "2024-03-31",
                              "1102",
                              "101",
                            ],
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
                              action: "/admin/events/upload",
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
                // setIsDeleteEventModalOpen(true);
                deleteAllCoursesFetcher.submit(null, {
                  method: "DELETE",
                  action: "/admin/events/delete",
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
          items={events}
        >
          {(events) => (
            <ListBoxItem
              className="flex items-center justify-between gap-2 px-2 py-3"
              key={events.id}
            >
              <span className="flex-1 truncate text-sm font-medium text-gray-900">
                {events.name}
              </span>
              <span className="flex-shrink-0 text-xs text-gray-800">
                {events.startDate} {events.endDate}
              </span>
              <span className="flex-shrink-0 text-xs text-gray-800">
                {events.startTime} {events.endTime}
              </span>
              <div className="flex items-center gap-2">
                <Button onPress={() => setEventId(events.id)}>
                  <PencilSquareIcon className="h-4 w-4 text-gray-400" />
                </Button>
                <Button
                  onPress={() => {
                    deleteCourseFetcher.submit(null, {
                      method: "DELETE",
                      action: `/event/${events.id}/delete`,
                    });
                  }}
                >
                  <TrashIcon className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </ListBoxItem>
          )}
        </ListBox>
      </div>

      <CreateEventModal
        isOpen={isNewEventModalOpen}
        onOpenChange={setIsNewEventModalOpen}
        courses={courses}
        classrooms={classrooms}
        repeat={repeat}
        allCourses={allCourses}
      />
      {/* <DeleteEventModal
        isOpen={isDeleteEventModalOpen}
        onOpenChange={setIsDeleteEventModalOpen}

      /> */}

      {selectedEvent && (
        <EditEventModal
          classrooms={classrooms}
          courses={courses}
          isAuthenticated
          repeat={repeat}
          isOpen={eventid !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEventId(null);
            }
          }}
          selectedEvent={selectedEvent}
        />
      )}
    </>
  );
}
