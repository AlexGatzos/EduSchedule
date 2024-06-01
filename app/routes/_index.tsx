import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ClockIcon,
  EnvelopeIcon,
} from "@heroicons/react/20/solid";
import { NavLink, useLoaderData } from "@remix-run/react";
import { prisma } from "~/database.server";

import type { DateDuration } from "@internationalized/date";

import {
  getLocalTimeZone,
  isSameMonth,
  isToday,
  CalendarDate,
  today,
  DateFormatter,
} from "@internationalized/date";
import {
  Bars3Icon,
  PlusIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Dialog as RACDialog, Menu, Transition } from "@headlessui/react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog,
  DialogTrigger,
  Heading,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  ModalOverlay,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";
import { useState, Fragment } from "react";
import type { DateValue } from "react-aria-components";
import { CreateEventModal } from "~/components/create-event-modal";
import { EditEventModal } from "~/components/edit-event-modal";
import { authenticator } from "~/services/auth.server";

import Logo from "~/components/Logo";

export const meta: MetaFunction = () => {
  return [
    { title: "EduSchedule" },
    { name: "description", content: "Classes" },
  ];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export async function loader({ request }: LoaderFunctionArgs) {
  let user = await authenticator.isAuthenticated(request);

  let events = await prisma.event.findMany();

  let courses = await prisma.course.findMany();

  let classrooms = await prisma.classroom.findMany();

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

  let calendars = await prisma.calendars.findMany({
    where: {
      userId: user?.profile.uid,
    },
  });

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
    user,
    allCourses,
    events,
    courses,
    classrooms,
    calendars: [
      {
        id: 0,
        userId: user?.profile.uid || "0",
        name: "All Events",
        courseIds: "[]",
      },
      ...calendars,
    ],
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

export default function Index() {
  let [isEventModalOpen, setIsEventModalOpen] = useState(false);
  let [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  let [eventId, setEventId] = useState<number>();
  let { user, calendars, allCourses, events, courses, classrooms, repeat } =
    useLoaderData<typeof loader>();

  let [selectedCalendar, setSelectedCalendar] = useState<{
    id: number;
    userId: string;
    name: string;
    courseIds: string;
  }>();
  let [selectedDate, setSelectedDate] = useState<DateValue>();
  let selectedEvent = events.find((event) => event.id === eventId);
  let [duration, setDuration] = useState<"month" | "week" | "day">("month");
  let [focusedDate, setFocusedDate] = useState<DateValue>(
    today(getLocalTimeZone()),
  );
  let [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  let visibleDurationMap: Record<"month" | "week" | "day", DateDuration> = {
    month: { months: 1 },
    week: { weeks: 1 },
    day: { days: 1 },
  };

  let visibleDuration = visibleDurationMap[duration];

  let excludedDates = [
    new Date(2024, 5, 1),
    new Date(2024, 3, 12),
    // ...
  ];

  let isArgia = selectedDate
    ? excludedDates.some((excludedDate) => {
        return (
          selectedDate?.toDate(getLocalTimeZone()).getDate() ===
            excludedDate.getDate() &&
          selectedDate?.toDate(getLocalTimeZone()).getMonth() ===
            excludedDate.getMonth() - 1 &&
          selectedDate?.toDate(getLocalTimeZone()).getFullYear() ===
            excludedDate.getFullYear()
        );
      })
    : false;

  let todaysEvents: Array<{
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    isRepeating: boolean;
    repeatDays: string;
    repeatInterval: string;
    startDate: string;
    endDate: string;
    classroomId: number;
    courseId: number;
    teachersId: number | null;
  }> = selectedDate
    ? events
        .filter((event) => {
          if (selectedCalendar) {
            let courseIds = JSON.parse(selectedCalendar.courseIds) as string[];

            if (courseIds.length === 0) {
              return true;
            }

            return courseIds
              .map((id) => parseInt(id, 10))
              .includes(event.courseId);
          }
          return true;
        })
        .filter((event) => {
          let eventDate = new Date(event.startDate);

          let isSpecificEvent =
            event.repeatInterval === "none" &&
            eventDate.getDate() === selectedDate?.day && // Tuesday
            eventDate.getMonth() === selectedDate?.month - 1 && // January
            eventDate.getFullYear() === selectedDate?.year; // 2024

          // Daily is without the weekend
          let isDailyRepeatingEvent =
            event.repeatInterval === "daily" &&
            selectedDate?.toDate(getLocalTimeZone()).getDay() !== 0 &&
            selectedDate?.toDate(getLocalTimeZone()).getDay() !== 6;

          // The event is repeating and the event day is the same as the date day
          let isWeeklyRepeatingEvent =
            event.repeatInterval === "weekly" &&
            eventDate.getDay() ===
              selectedDate?.toDate(getLocalTimeZone()).getDay();

          let isYearlyRepeatingEvent =
            event.repeatInterval === "yearly" &&
            eventDate.getDate() === selectedDate?.day && // Tuesday
            eventDate.getMonth() === selectedDate?.month - 1; // January

          let isDateBetweenEvent =
            selectedDate?.toDate("UTC") >= new Date(event.startDate) &&
            selectedDate?.toDate("UTC") <= new Date(event.endDate);

          // If event is inside the semester return the event if not return false
          return (
            isDateBetweenEvent &&
            (isSpecificEvent ||
              isDailyRepeatingEvent ||
              isWeeklyRepeatingEvent ||
              isYearlyRepeatingEvent) !== isArgia
          );
        })
        .sort((a, b) => {
          return a.startTime.localeCompare(b.startTime);
        })
    : [];

  return (
    <div className="flex h-full flex-col">
      <Calendar
        aria-label="Courses"
        className="flex h-full w-full flex-1 flex-col "
        focusedValue={focusedDate}
        onFocusChange={setFocusedDate}
        visibleDuration={visibleDuration}
        onChange={(date) => {
          setSelectedDate(date);
          if (
            user &&
            (user.profile.eduPersonAffiliation === "staff" ||
              user.profile.isAdmin)
          ) {
            setIsEventModalOpen(true);
          }
        }}
      >
        <header className="flex border-b border-gray-900/10 py-4">
          <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center gap-x-3">
              <button
                type="button"
                className="-m-3 p-3 md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  className="h-5 w-5 text-gray-900"
                  aria-hidden="true"
                />
              </button>
              <NavLink to="/" className="flex-shrink-0">
                <Logo />
              </NavLink>

              <Heading className="text-base font-semibold leading-6 text-gray-900" />
            </div>
            <div className="flex items-center gap-2 ">
              {user && (
                <Select
                  onSelectionChange={(key) => {
                    setSelectedCalendar(
                      calendars.find((calendar) => calendar.id === key),
                    );
                  }}
                  defaultSelectedKey={0}
                  name="calendar"
                  placeholder="Select a calendar"
                  className=" hidden flex-col gap-1 md:flex"
                >
                  <Label className="hidden text-sm">Calendar</Label>
                  <Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    <SelectValue className="block truncate" />
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Button>
                  <Popover className="z-10 mt-1 max-h-60 min-w-[30ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <ListBox
                      className="w-full focus:outline-none"
                      items={calendars}
                    >
                      {(item) => (
                        <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 aria-selected:font-semibold focus:bg-indigo-600 focus:text-white focus:outline-none">
                          {item.name}
                          <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                        </ListBoxItem>
                      )}
                    </ListBox>
                  </Popover>
                </Select>
              )}
              <Select
                selectedKey={duration}
                onSelectionChange={(key) => {
                  let value = key.toString() as "month" | "week" | "day";
                  if (value === "month") {
                    let newDate = new CalendarDate(
                      focusedDate.year,
                      focusedDate.month,
                      1,
                    );
                    setFocusedDate(newDate);
                  }
                  setDuration(value);
                }}
                name="duration"
                placeholder="Select duration"
                className=" hidden flex-col gap-1 md:flex"
              >
                <Label className="hidden text-sm">Duration</Label>
                <Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                  <SelectValue className="block truncate" />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Button>
                <Popover className="z-10 mt-1 max-h-60 min-w-[30ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListBox
                    className="w-full focus:outline-none"
                    items={Object.keys(visibleDurationMap).map((key) => ({
                      key,
                      name: key.charAt(0).toUpperCase() + key.slice(1),
                      id: key,
                    }))}
                  >
                    {(item) => (
                      <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 aria-selected:font-semibold focus:bg-indigo-600 focus:text-white focus:outline-none">
                        {item.name}
                        <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                      </ListBoxItem>
                    )}
                  </ListBox>
                </Popover>
              </Select>
              <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                <Button
                  slot="previous"
                  type="button"
                  className="flex h-7 w-10 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:h-9 md:w-9  md:pr-0 md:hover:bg-gray-50"
                >
                  <span className="sr-only">Previous month</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  slot={null}
                  className="hidden select-none items-center border-y border-gray-300  px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:flex"
                  onPress={() => {
                    setFocusedDate(today(getLocalTimeZone()));
                  }}
                >
                  Today
                </Button>
                <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                <Button
                  slot="next"
                  type="button"
                  className="flex h-7 w-10 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:h-9 md:w-9  md:pl-0 md:hover:bg-gray-50"
                >
                  <span className="sr-only">Next month</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
              <div className="h-6 w-px bg-gray-300" />

              {user &&
              (user.profile.eduPersonAffiliation === "staff" ||
                user.profile.isAdmin) ? (
                <Button
                  slot={null}
                  onPress={() => setIsEventModalOpen(true)}
                  type="button"
                  className=" hidden items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:flex"
                >
                  <PlusIcon className="w-4" /> Add event
                </Button>
              ) : null}

              {user ? (
                <>
                  <Menu as="div" className="relative flex-shrink-0">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-10 w-10 rounded-full"
                          src={
                            user?.profile.profilePhoto ||
                            "https://images.unsplash.com/photo-1544890225-2f3faec4cd60?q=80&w=3850&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                          }
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block border-b px-4 py-2 text-sm text-gray-700  md:hidden",
                              )}
                            >
                              <Button
                                slot={null}
                                className="flex h-full w-full items-center justify-start gap-2"
                                onPress={() => {
                                  setFocusedDate(today(getLocalTimeZone()));
                                }}
                              >
                                Today
                              </Button>
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700",
                              )}
                            >
                              <Button
                                className={"flex h-full w-full justify-start "}
                                slot={null}
                                onPress={() => setIsProfileModalOpen(true)}
                              >
                                Your Profile
                              </Button>
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700",
                              )}
                            >
                              <a
                                className={"flex h-full w-full justify-start "}
                                href={`/user`}
                                type="submit"
                              >
                                Calendars
                              </a>
                            </div>
                          )}
                        </Menu.Item>

                        {user.profile.isAdmin ? (
                          <Menu.Item>
                            {({ active }) => (
                              <div
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700",
                                )}
                              >
                                <a
                                  className={
                                    "flex h-full w-full justify-start "
                                  }
                                  href={`/admin`}
                                  type="submit"
                                >
                                  Admin
                                </a>
                              </div>
                            )}
                          </Menu.Item>
                        ) : null}

                        <Menu.Item key={"item.name"}>
                          {({ active }) => (
                            <form
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700",
                              )}
                              action="/auth/logout"
                              method="POST"
                            >
                              <Button
                                className={"flex h-full w-full justify-start "}
                                type="submit"
                                slot={null}
                              >
                                Logout
                              </Button>
                            </form>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>{" "}
                </>
              ) : (
                <NavLink
                  className="flex items-center gap-2 rounded-md bg-zinc-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
                  to="/auth/login"
                >
                  <UserCircleIcon className="w-5" />
                  Login
                </NavLink>
              )}
            </div>
          </div>

          <RACDialog
            as="div"
            className="lg:hidden"
            open={mobileMenuOpen}
            onClose={setMobileMenuOpen}
          >
            <div className="fixed inset-0 z-50" />
            <RACDialog.Panel className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-4 pb-6 sm:max-w-sm sm:px-6 sm:ring-1 sm:ring-gray-900/10">
              <div className="-ml-0.5 flex h-16 items-center gap-x-6">
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="-ml-0.5">
                  <NavLink to="/" className="flex-shrink-0">
                    <Logo />
                  </NavLink>
                </div>
              </div>
              <ul className="mt-2 space-y-2">
                <li className="group flex w-52 gap-x-3 rounded-md  py-2 pl-2 pr-3 text-sm font-semibold leading-6 text-gray-600 hover:bg-gray-50 hover:text-indigo-600">
                  {user &&
                  (user.profile.eduPersonAffiliation === "staff" ||
                    user.profile.isAdmin) ? (
                    <Button
                      slot={null}
                      onPress={() => {
                        setIsEventModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      // onPress={() => setMobileMenuOpen(false)}
                      type="button"
                      className="flex h-full w-full items-center justify-start gap-2 "
                    >
                      <PlusIcon className="w-5" />
                      Add event
                    </Button>
                  ) : null}
                </li>
                <li className="group flex w-52 gap-x-3 rounded-md  py-2 pl-2 pr-3 text-sm font-semibold leading-6 text-gray-600 hover:bg-gray-50 hover:text-indigo-600">
                  {user && (
                    <Select
                      onSelectionChange={(key) => {
                        setSelectedCalendar(
                          calendars.find((calendar) => calendar.id === key),
                        );
                      }}
                      defaultSelectedKey={0}
                      name="calendar"
                      placeholder="Select a calendar"
                      className="flex-col gap-1"
                    >
                      <Label className="hidden text-sm">Calendar</Label>
                      <Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <SelectValue className="block truncate" />
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Button>
                      <Popover className="z-10 mt-1 max-h-60 min-w-[30ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <ListBox
                          className="w-full focus:outline-none"
                          items={calendars}
                        >
                          {(item) => (
                            <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 aria-selected:font-semibold focus:bg-indigo-600 focus:text-white focus:outline-none">
                              {item.name}
                              <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                            </ListBoxItem>
                          )}
                        </ListBox>
                      </Popover>
                    </Select>
                  )}
                </li>
                <li className="group flex w-52 gap-x-3 rounded-md  py-2 pl-2 pr-3 text-sm font-semibold leading-6 text-gray-600 hover:bg-gray-50 hover:text-indigo-600">
                  <Select
                    selectedKey={duration}
                    onSelectionChange={(key) => {
                      let value = key.toString() as "month" | "week" | "day";
                      if (value === "month") {
                        let newDate = new CalendarDate(
                          focusedDate.year,
                          focusedDate.month,
                          1,
                        );
                        setFocusedDate(newDate);
                      }
                      setDuration(value);
                    }}
                    name="duration"
                    placeholder="Select duration"
                    className=" flex flex-col gap-1 "
                  >
                    <Label className="hidden text-sm">Duration</Label>
                    <Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                      <SelectValue className="block truncate" />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Button>
                    <Popover className="z-10 mt-1 max-h-60 min-w-[30ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      <ListBox
                        className="w-full focus:outline-none"
                        items={Object.keys(visibleDurationMap).map((key) => ({
                          key,
                          name: key.charAt(0).toUpperCase() + key.slice(1),
                          id: key,
                        }))}
                      >
                        {(item) => (
                          <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 aria-selected:font-semibold focus:bg-indigo-600 focus:text-white focus:outline-none">
                            {item.name}
                            <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                          </ListBoxItem>
                        )}
                      </ListBox>
                    </Popover>
                  </Select>
                </li>
              </ul>
            </RACDialog.Panel>
          </RACDialog>
        </header>
        <CalendarGrid
          weekdayStyle={duration === "day" ? "long" : "short"}
          className="flex h-fit w-full min-w-full flex-1 flex-col  shadow ring-1 ring-black ring-opacity-5"
        >
          <CalendarGridHeader
            className={
              duration === "day"
                ? `
          border-b border-zinc-200 bg-white text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none [&_tr]:grid [&_tr]:grid-cols-1 [&_tr_>_th]:hidden
          ${
            [
              "[&_tr:first-child_>_th:nth-child(7)]:block",
              "[&_tr:first-child_>_th:nth-child(1)]:block",
              "[&_tr:first-child_>_th:nth-child(2)]:block",
              "[&_tr:first-child_>_th:nth-child(3)]:block",
              "[&_tr:first-child_>_th:nth-child(4)]:block",
              "[&_tr:first-child_>_th:nth-child(5)]:block",
              "[&_tr:first-child_>_th:nth-child(6)]:block",
            ][
              focusedDate?.toDate(getLocalTimeZone()).getDay() ||
              focusedDate?.toDate(getLocalTimeZone()).getDay() === 0
                ? focusedDate?.toDate(getLocalTimeZone()).getDay()
                : 0
            ]
          }
          `
                : "border-b border-zinc-200 bg-white text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none [&_tr]:grid [&_tr]:grid-cols-7"
            }
          >
            {(day) => (
              <CalendarHeaderCell className={"bg-white py-2 text-zinc-800 "}>
                {day}
              </CalendarHeaderCell>
            )}
          </CalendarGridHeader>
          <CalendarGridBody
            className={
              duration === "month"
                ? "grid grid-rows-5 sm:flex-1 [&_tr]:grid [&_tr]:grid-cols-7 [&_tr]:divide-x [&_tr]:divide-zinc-200 [&_tr_>_td]:border-b [&_tr_>_td]:border-b-zinc-200"
                : duration === "week"
                  ? "grid flex-1 grid-rows-1 [&_tr:first-child]:grid [&_tr]:hidden [&_tr]:grid-cols-7 [&_tr]:divide-x [&_tr]:divide-zinc-200 [&_tr_>_td]:border-b [&_tr_>_td]:border-b-zinc-200"
                  : `grid flex-1 grid-rows-1 [&_tr:first-child]:grid [&_tr:first-child_>_td]:hidden [&_tr]:hidden [&_tr]:grid-cols-1 [&_tr]:divide-x [&_tr]:divide-zinc-200 [&_tr_>_td]:border-b [&_tr_>_td]:border-b-zinc-200 ${
                      [
                        "[&_tr:first-child_>_td:nth-child(7)]:block",
                        "[&_tr:first-child_>_td:nth-child(1)]:block",
                        "[&_tr:first-child_>_td:nth-child(2)]:block",
                        "[&_tr:first-child_>_td:nth-child(3)]:block",
                        "[&_tr:first-child_>_td:nth-child(4)]:block",
                        "[&_tr:first-child_>_td:nth-child(5)]:block",
                        "[&_tr:first-child_>_td:nth-child(6)]:block",
                      ][
                        focusedDate?.toDate(getLocalTimeZone()).getDay() ||
                        focusedDate?.toDate(getLocalTimeZone()).getDay() === 0
                          ? focusedDate?.toDate(getLocalTimeZone()).getDay()
                          : 0
                      ]
                    }`
            }
          >
            {(date) => {
              let excludedDates = [
                new Date(2024, 5, 1),
                new Date(2024, 3, 12),
                // ...
              ];

              let isArgia = excludedDates.some((excludedDate) => {
                return (
                  date.toDate(getLocalTimeZone()).getDate() ===
                    excludedDate.getDate() &&
                  date.toDate(getLocalTimeZone()).getMonth() ===
                    excludedDate.getMonth() - 1 &&
                  date.toDate(getLocalTimeZone()).getFullYear() ===
                    excludedDate.getFullYear()
                );
              });

              let dayEvents = events
                .filter((event) => {
                  if (selectedCalendar) {
                    let courseIds = JSON.parse(
                      selectedCalendar.courseIds,
                    ) as string[];

                    if (courseIds.length === 0) {
                      return true;
                    }

                    return courseIds
                      .map((id) => parseInt(id, 10))
                      .includes(event.courseId);
                  }
                  return true;
                })
                .filter((event) => {
                  let eventDate = new Date(event.startDate);

                  let isSpecificEvent =
                    event.repeatInterval === "none" &&
                    eventDate.getDate() === date.day && // Tuesday
                    eventDate.getMonth() === date.month - 1 && // January
                    eventDate.getFullYear() === date.year; // 2024

                  // Daily is without the weekend
                  let isDailyRepeatingEvent =
                    event.repeatInterval === "daily" &&
                    date.toDate(getLocalTimeZone()).getDay() !== 0 &&
                    date.toDate(getLocalTimeZone()).getDay() !== 6;

                  // The event is repeating and the event day is the same as the date day
                  let isWeeklyRepeatingEvent =
                    event.repeatInterval === "weekly" &&
                    eventDate.getDay() ===
                      date.toDate(getLocalTimeZone()).getDay();

                  let isYearlyRepeatingEvent =
                    event.repeatInterval === "yearly" &&
                    eventDate.getDate() === date.day && // Tuesday
                    eventDate.getMonth() === date.month - 1; // January

                  let isDateBetweenEvent =
                    date.toDate("UTC") >= new Date(event.startDate) &&
                    date.toDate("UTC") <= new Date(event.endDate);

                  // If event is inside the semester return the event if not return false
                  return (
                    isDateBetweenEvent &&
                    (isSpecificEvent ||
                      isDailyRepeatingEvent ||
                      isWeeklyRepeatingEvent ||
                      isYearlyRepeatingEvent) !== isArgia
                  );
                })
                .sort((a, b) => {
                  return a.startTime.localeCompare(b.startTime);
                });

              let isDateForCurrentMonth = isSameMonth(
                date,
                today(getLocalTimeZone()),
              );

              return (
                <CalendarCell
                  date={date}
                  className={classNames(
                    date.compare(focusedDate) === 0
                      ? "ring ring-indigo-100"
                      : "",
                    isDateForCurrentMonth ? "bg-white" : "",
                    isArgia ? "bg-yellow-300/30" : "",
                    !isDateForCurrentMonth ? "bg-gray-50 text-gray-400" : "",
                    isDateForCurrentMonth ? "text-gray-900" : "",
                    "relative flex h-full w-full flex-col p-3 outline-none ring-indigo-300 data-[focused]:ring",
                  )}
                >
                  <span className="flex w-full items-center justify-end">
                    <time
                      dateTime={date.toDate(getLocalTimeZone()).toISOString()}
                      className={
                        isToday(date, getLocalTimeZone())
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white"
                          : undefined
                      }
                    >
                      {date.day}
                    </time>
                  </span>
                  {dayEvents.length > 0 && (
                    <ol className="mt-2 ">
                      {dayEvents
                        .slice(0, duration === "month" ? 2 : dayEvents.length)
                        .map((event) => (
                          <li key={event.id} className="hidden w-full sm:flex">
                            <Button
                              slot={null}
                              onPress={() => setEventId(event.id)}
                              className="group flex w-full items-center justify-between gap-1 rounded px-1 transition-colors @container hover:bg-indigo-500/15"
                            >
                              <p className="truncate text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                                {event.name}
                              </p>
                              <time
                                dateTime={event.startDate}
                                className="hidden flex-none flex-nowrap items-center text-xs text-gray-500 group-hover:text-indigo-600 @[100px]:flex"
                              >
                                <span>
                                  {event.startTime
                                    .split(":")
                                    .slice(0, 2)
                                    .join(":")}
                                </span>
                                <span className="hidden @[140px]:block">
                                  {" - "}
                                  {event.endTime
                                    .split(":")
                                    .slice(0, 2)
                                    .join(":")}
                                </span>
                              </time>
                            </Button>
                          </li>
                        ))}
                      <div className="hidden sm:block">
                        {dayEvents.length > 2 && duration === "month" && (
                          <DialogTrigger>
                            <Button
                              slot={null}
                              className="text-sm text-gray-500"
                            >
                              + {dayEvents.length - 2} more
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
                            w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl
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
                                  className="relative flex max-h-[80vh] flex-col outline-none"
                                >
                                  {({ close }) => (
                                    <>
                                      <Heading
                                        slot="title"
                                        className="text-xxl my-0 font-semibold leading-6 text-slate-700"
                                      >
                                        {new DateFormatter("en-US", {
                                          weekday: "long",
                                          month: "long",
                                          day: "numeric",
                                        }).format(
                                          date.toDate(getLocalTimeZone()),
                                        )}
                                      </Heading>

                                      <ol className="mt-2 flex-1 overflow-y-auto">
                                        {dayEvents.map((event) => (
                                          <li
                                            key={event.id}
                                            className="w-full overflow-hidden"
                                          >
                                            <Button
                                              slot={null}
                                              onPress={() => {
                                                setEventId(event.id);
                                                close();
                                              }}
                                              className="group flex w-full items-center justify-between gap-1 rounded px-1 transition-colors hover:bg-indigo-500/15"
                                            >
                                              <p className="truncate text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                                                {event.name}
                                              </p>
                                              <time
                                                dateTime={event.startDate}
                                                className="ml-3 flex-none text-xs text-gray-500 group-hover:text-indigo-600 xl:block"
                                              >
                                                {/* Get the hour and minutes */}
                                                {event.startTime
                                                  .split(":")
                                                  .slice(0, 2)
                                                  .join(":")}
                                                {" - "}
                                                {event.endTime
                                                  .split(":")
                                                  .slice(0, 2)
                                                  .join(":")}
                                              </time>
                                            </Button>
                                          </li>
                                        ))}
                                      </ol>
                                    </>
                                  )}
                                </Dialog>
                              </Modal>
                            </ModalOverlay>
                          </DialogTrigger>
                        )}
                      </div>
                      <div className="sm:hidden">
                        {dayEvents.length > 0 && duration === "month" && (
                          <div className="text-sm text-gray-500">
                            {dayEvents.length > 0 && (
                              <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                                {dayEvents.map((event) => (
                                  <span
                                    key={event.id}
                                    className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"
                                  />
                                ))}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </ol>
                  )}
                </CalendarCell>
              );
            }}
          </CalendarGridBody>
        </CalendarGrid>
      </Calendar>

      {todaysEvents.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-10 sm:px-6 lg:hidden">
          <ol className="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5">
            {todaysEvents.map((event) => (
              <li
                key={event.id}
                className="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50"
              >
                <div className="flex-auto">
                  <p className="font-semibold text-gray-900">{event.name}</p>
                  <time
                    dateTime={event.startTime}
                    className="mt-2 flex items-center text-gray-700"
                  >
                    <ClockIcon
                      className="mr-2 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    {event.startTime.split(":").slice(0, 2).join(":")} -{" "}
                    {event.endTime.split(":").slice(0, 2).join(":")}
                  </time>
                </div>
                <Button
                  slot={null}
                  onPress={() => setEventId(event.id)}
                  className="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 opacity-100 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400"
                >
                  {user &&
                  (user.profile.isAdmin ||
                    user?.profile.eduPersonAffiliation === "staff")
                    ? "Edit"
                    : "View"}
                  <span className="sr-only">, {event.name}</span>
                </Button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {Boolean(
        user &&
          (user.profile.eduPersonAffiliation === "staff" ||
            user.profile.isAdmin),
      ) && (
        <CreateEventModal
          isOpen={isEventModalOpen}
          onOpenChange={setIsEventModalOpen}
          courses={courses}
          classrooms={classrooms}
          repeat={repeat}
          selectedDate={selectedDate}
          allCourses={allCourses}
        />
      )}

      {selectedEvent && (
        <EditEventModal
          isAuthenticated={Boolean(
            user &&
              (user.profile.eduPersonAffiliation === "staff" ||
                user.profile.isAdmin),
          )}
          repeat={repeat}
          courses={courses}
          classrooms={classrooms}
          isOpen={Boolean(eventId)}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEventId(undefined);
            }
          }}
          selectedEvent={selectedEvent}
        />
      )}

      <ModalOverlay
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        isDismissable
        className={({ isEntering, isExiting }) => `
                  fixed inset-0 z-10 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur
                  ${
                    isEntering ? "duration-300 ease-out animate-in fade-in" : ""
                  }
                  ${
                    isExiting ? "duration-200 ease-in animate-out fade-out" : ""
                  }
                `}
      >
        <Modal className=" w-96 ">
          <Dialog className="flex h-full w-full flex-col justify-center bg-opacity-0 p-14 focus:outline-none md:p-4">
            {({ close }) => (
              <div>
                <ul className="grid grid-cols-1  gap-6 rounded-lg border border-indigo-300 border-opacity-20 shadow-2xl shadow-indigo-200">
                  <li
                    key={""}
                    className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
                  >
                    <div className="flex flex-1 flex-col p-8">
                      <img
                        className="mx-auto h-32 w-32 flex-shrink-0 rounded-full"
                        src={
                          user?.profile.profilePhoto ||
                          "https://images.unsplash.com/photo-1544890225-2f3faec4cd60?q=80&w=3850&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        }
                        alt=""
                      />
                      <h3 className="mt-6 text-sm font-medium text-gray-900">
                        {user?.profile.cn || " "}
                      </h3>
                      <dl className="mt-1 flex flex-grow flex-col justify-between">
                        <dt className="sr-only">Title</dt>
                        <dd className="text-sm text-gray-500">
                          {user?.profile.title}
                        </dd>
                        <dt className="sr-only">Title</dt>
                        <dd className="text-sm text-gray-500">
                          {user?.profile.regyear}
                        </dd>
                        <dt className="sr-only">Title</dt>
                        <dd className="text-sm text-gray-500">
                          {"AM:" + user?.profile.am}
                        </dd>

                        <dt className="sr-only">Role</dt>
                        <dd className="mt-3">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {user?.profile.eduPersonAffiliation}
                          </span>
                        </dd>
                      </dl>
                    </div>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                          <a
                            href={`mailto:${""}`}
                            className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                          >
                            <EnvelopeIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                            {user?.profile.mail || " "}
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
