import type { LoaderFunctionArgs } from "@remix-run/node";
import { CheckIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno

import { prisma } from "~/database.server";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  type Selection,
  Button,
  Heading,
  ListBox,
  ListBoxItem,
  Header,
  Label,
  Input,
  Dialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { authenticator } from "~/services/auth.server";
import { useRef, useState } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

export async function loader({ request }: LoaderFunctionArgs) {
  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  let calendars = await prisma.calendars.findMany({
    where: {
      userId: user.profile.uid,
    },
  });

  let courses = await prisma.course.findMany();

  let calendarsWithEvents = calendars.map((calendar) => ({
    ...calendar,
    courses: courses.filter((course) => {
      let courseIds: string[] = [];
      try {
        courseIds = JSON.parse(calendar.courseIds) as string[];
      } catch {
        courseIds = [];
      }

      return courseIds.map((id) => parseInt(id, 10)).includes(course.id);
    }),
  }));

  return json({ calendars: calendarsWithEvents, courses });
}

export default function Calendars() {
  let { calendars, courses } = useLoaderData<typeof loader>();
  let [isNewCalendarModalOpen, setIsNewCalendarModalOpen] = useState(false);
  let deleteCourseFetcher = useFetcher();
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <Heading className="text-2xl font-bold">My Calendars</Heading>
          <div className="flex items-center gap-2">
            <Button
              slot={null}
              type="button"
              onPress={() => setIsNewCalendarModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:px-3 sm:py-2"
            >
              <PlusIcon className="w-4" />{" "}
              <span className="hidden sm:block">New Calendar</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {calendars.map((calendar) => (
            <div
              className="flex flex-col divide-y overflow-hidden rounded border"
              key={calendar.id}
            >
              <Header className="flex items-center justify-between gap-2 bg-indigo-50 px-2 py-2 text-lg font-semibold text-indigo-500">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-5" />
                  {calendar.name}
                </div>
                <Button
                  className="flex items-center gap-2 rounded-md bg-white/50 px-2 py-1 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
                  onPress={() => {
                    deleteCourseFetcher.submit(null, {
                      method: "DELETE",
                      action: `/user/calendars/${calendar.id}/delete`,
                    });
                  }}
                >
                  <TrashIcon className="w-4" />
                </Button>
              </Header>

              {calendar.courses.map((course) => (
                <div
                  className="flex items-center justify-between gap-2 px-2 py-3"
                  key={course.id}
                >
                  {/* <div>{event.name}</div> */}
                  <div
                    aria-label={course.name}
                    className="group flex gap-2 overflow-hidden px-5"
                    key={course.id}
                  >
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="w-full flex-1 truncate text-sm font-medium text-gray-900">
                        {course.name}
                      </span>
                      {/* <span className="flex items-center gap-2 text-sm">
                          <ClockIcon className="w-4" />
                          {new Date(course.startDate).toLocaleDateString(
                            "el-GR",
                            { weekday: "long" },
                          )}{" "}
                          {course.startTime.substring(0, 5)} -{" "}
                          {course.endTime.substring(0, 5)}
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <BuildingOffice2Icon className="w-4" />
                          Αίθουσα{" "}
                          {
                            classrooms.find(
                              (classroom) => classroom.id === course.classroomId,
                            )?.name
                          }
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <BookOpenIcon className="w-4" />
                          {
                            courses.find(
                              (course) => course.id === course.courseId,
                            )?.name
                          }
                        </span>
                        {course.repeatInterval === "daily" ? (
                          <span className="flex items-center gap-2 text-sm">
                            <CalendarDaysIcon className="w-4" />
                            Κάθε μέρα από {
                              course.startDate.split("T")[0]
                            } μέχρι {course.endDate.split("T")[0]}
                          </span>
                        ) : course.repeatInterval === "weekly" ? (
                          <span className="flex items-center gap-2 text-sm">
                            <CalendarDaysIcon className="w-4" />
                            Κάθε εβδομάδα από {
                              course.startDate.split("T")[0]
                            }{" "}
                            μέχρι {course.endDate.split("T")[0]}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-sm">
                            <CalendarDaysIcon className="w-4" />
                            Μονο για την ημερομηνία{" "}
                            {course.startDate.split("T")[0]}
                          </span>
                        )} */}
                    </div>

                    <CheckIcon className="hidden w-3 group-data-[selected]:block" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <CalendarModal
        courses={courses}
        isOpen={isNewCalendarModalOpen}
        onOpenChange={setIsNewCalendarModalOpen}
      />
    </>
  );
}

type CalendarModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  courses: {
    id: number;
    course_id: number;
    name: string;
    type: string;
    semester: string;
  }[];
};

function CalendarModal({ courses, isOpen, onOpenChange }: CalendarModalProps) {
  let [selectedIds, setSelectedIds] = useState<Selection>(new Set());
  let createCalendarFetcher = useFetcher();
  let inputRef = useRef<HTMLInputElement>(null);
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-10 bg-zinc-100 bg-opacity-30 backdrop-blur"
    >
      <Modal className="fixed bottom-0 right-0 top-0 w-96 border-l border-gray-400 bg-zinc-50 shadow-lg outline-none">
        <Dialog className="flex h-full w-full flex-col gap-4 overflow-hidden p-4 focus:outline-none">
          {({ close }) => (
            <>
              <Heading
                slot="title"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <PlusIcon className="w-5" /> Create new Calendar
              </Heading>
              <Label className="flex flex-col gap-1">
                <span className="text-sm">Calendar Name</span>
                <Input
                  ref={inputRef}
                  name="calendarName"
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </Label>
              <div className="flex w-full flex-1 flex-col gap-1 overflow-hidden">
                <Label className="w-full text-sm">Events</Label>
                <ListBox
                  aria-label="Courses"
                  selectionMode="multiple"
                  selectedKeys={selectedIds}
                  onSelectionChange={setSelectedIds}
                  className="flex w-full flex-col divide-y divide-solid overflow-y-auto overflow-x-hidden rounded border"
                  items={courses}
                >
                  {(course) => (
                    <ListBoxItem
                      id={course.id}
                      textValue={course.name}
                      aria-label={course.name}
                      className="group flex items-center gap-2 px-5 py-2"
                      key={course.id}
                    >
                      <span className="flex-1 truncate text-sm font-bold text-gray-900">
                        {course.name}
                      </span>

                      <CheckIcon className="invisible w-4 text-indigo-600 group-data-[selected]:visible" />
                    </ListBoxItem>
                  )}
                </ListBox>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  slot={null}
                  onPress={() => {
                    if (!inputRef.current) {
                      return;
                    }
                    let selectedCourses = courses.filter((course) => {
                      if (selectedIds === "all") {
                        return true;
                      } else {
                        return selectedIds.has(course.id);
                      }
                    });
                    let courseIds = JSON.stringify(
                      selectedCourses.map((event) => event.id),
                    );

                    createCalendarFetcher.submit(
                      { courseIds, name: inputRef.current.value },
                      {
                        method: "POST",
                        action: "/user/calendars/create",
                        encType: "multipart/form-data",
                      },
                    );
                  }}
                  type="button"
                  className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="w-4" /> Save
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
