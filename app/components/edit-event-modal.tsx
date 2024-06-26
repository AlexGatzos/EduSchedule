import {
  ChevronUpDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightStartOnRectangleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import {
  BookOpenIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Time, fromDate, getLocalTimeZone } from "@internationalized/date";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import type { DateValue, ModalOverlayProps } from "react-aria-components";
import {
  ModalOverlay,
  Modal,
  Dialog,
  Heading,
  Form,
  Select,
  Label,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  TimeField,
  DateInput,
  DateSegment,
  FieldError,
  DatePicker,
  Group,
  Calendar,
  CalendarGrid,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  CalendarCell,
  Text,
  Input,
  TextField,
} from "react-aria-components";
import type { ActionData as DeleteEventActionData } from "~/routes/event.$id.delete";
import type { ActionData as DeleteDateActionData } from "~/routes/event.$id.$date.delete";

import type { ActionData } from "~/routes/event.$id.update";

export function EditEventModal(
  props: ModalOverlayProps &
    React.RefAttributes<HTMLDivElement> & {
      isAuthenticated: boolean;
      selectedDate?: DateValue | null;
      courses: { id: number; name: string }[];
      classrooms: { id: number; name: string }[];
      repeat: { id: string; name: string }[];
      selectedEvent: {
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
      };
    },
) {
  let {
    isAuthenticated,
    selectedDate,
    courses,
    classrooms,
    repeat,
    isOpen,
    onOpenChange,
    selectedEvent,
  } = props;
  let { state, data, submit } = useFetcher<ActionData>();
  let deleteFetcher = useFetcher<DeleteEventActionData>();
  let deleteDateFetcher = useFetcher<DeleteDateActionData>();

  let errors = data && "errors" in data ? data.errors : undefined;

  useEffect(() => {
    if (data && !errors && state !== "idle") {
      onOpenChange?.(false);
    }
  }, [data, errors, onOpenChange, state]);

  useEffect(() => {
    if (deleteFetcher.data && deleteFetcher.state !== "idle") {
      onOpenChange?.(false);
    }
  }, [deleteFetcher.data, deleteFetcher.state, onOpenChange, state]);

  useEffect(() => {
    if (deleteDateFetcher.data && deleteDateFetcher.state !== "idle") {
      onOpenChange?.(false);
    }
  }, [deleteDateFetcher.data, deleteDateFetcher.state, onOpenChange, state]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 bg-zinc-100 bg-opacity-30 backdrop-blur"
    >
      <Modal className="fixed bottom-0 right-0 top-0 max-w-[80%] border-l border-gray-400 bg-zinc-50 shadow-lg outline-none sm:w-96">
        <Dialog className="relative flex h-full w-full flex-col gap-4 overflow-y-auto p-4 pt-2 focus:outline-none">
          {({ close }) => (
            <>
              <Heading
                slot="title"
                className="flex w-full items-center gap-2 text-lg font-semibold"
              >
                <PencilSquareIcon className="w-5" />
                <span className="flex-1">{selectedEvent?.name}</span>
              </Heading>
              {isAuthenticated && (
                <>
                  <Form
                    method="post"
                    action={`/event/${selectedEvent?.id}/update`}
                    className="flex flex-col gap-3"
                    validationErrors={errors}
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit(e.currentTarget);
                    }}
                  >
                    <TextField
                      className="flex flex-col gap-1"
                      name="name"
                      defaultValue={selectedEvent?.name}
                      type="text"
                    >
                      <Label>
                        <span className="text-sm">Name</span>
                      </Label>
                      <Input
                        name="name"
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <FieldError className="text-xs text-rose-500" />
                    </TextField>

                    <Select
                      defaultSelectedKey={selectedEvent?.courseId}
                      name="courseId"
                      className="flex flex-col gap-1"
                    >
                      <Label className="text-sm">Course</Label>
                      <Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <SelectValue className="block truncate" />
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Button>
                      <FieldError className="text-xs text-rose-500" />
                      <Popover className="z-10 mt-1 max-h-60 min-w-[30ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <ListBox
                          className="w-full focus:outline-none"
                          items={courses}
                        >
                          {(course) => (
                            <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 aria-selected:font-semibold focus:bg-indigo-600 focus:text-white focus:outline-none">
                              {course.name}
                              <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                            </ListBoxItem>
                          )}
                        </ListBox>
                      </Popover>
                    </Select>

                    <Select
                      defaultSelectedKey={selectedEvent?.classroomId}
                      name="classroomId"
                      className="flex flex-col gap-1"
                    >
                      <Label className="text-sm">Classroom</Label>
                      <Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <SelectValue className="block truncate" />
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Button>
                      <FieldError className="text-xs text-rose-500" />
                      <Popover className="z-10 mt-1 max-h-60 min-w-[30ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <ListBox
                          className="w-full focus:outline-none"
                          items={classrooms}
                        >
                          {(classroom) => {
                            return (
                              <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 aria-selected:font-semibold focus:bg-indigo-600 focus:text-white focus:outline-none">
                                <span>{classroom.name}</span>
                                <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                              </ListBoxItem>
                            );
                          }}
                        </ListBox>
                      </Popover>
                    </Select>

                    <div>
                      <Label className="text-sm">Time</Label>
                      <div className="relative flex w-full cursor-default items-center gap-2 rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <TimeField
                          defaultValue={
                            new Time(
                              parseInt(
                                selectedEvent?.startTime.split(":")[0] ?? "00",
                              ),
                              parseInt(
                                selectedEvent?.startTime.split(":")[1] ?? "00",
                              ),
                            )
                          }
                          name="startTime"
                        >
                          <DateInput className="flex w-auto items-center whitespace-nowrap ">
                            {(segment) => <DateSegment segment={segment} />}
                          </DateInput>
                          <Text slot="description" />
                        </TimeField>
                        <TimeField
                          defaultValue={
                            new Time(
                              parseInt(
                                selectedEvent?.endTime.split(":")[0] ?? "00",
                              ),
                              parseInt(
                                selectedEvent?.endTime.split(":")[1] ?? "00",
                              ),
                            )
                          }
                          name="endTime"
                        >
                          <DateInput className="flex w-auto items-center whitespace-nowrap ">
                            {(segment) => <DateSegment segment={segment} />}
                          </DateInput>
                          <Text slot="description" />
                        </TimeField>
                      </div>
                      {errors && "startTime" in errors && errors.startTime && (
                        <div className="text-xs text-rose-500">
                          {errors.startTime}
                        </div>
                      )}
                      {errors && "endTime" in errors && errors.endTime && (
                        <div className="text-xs text-rose-500">
                          {errors.endTime}
                        </div>
                      )}
                    </div>

                    <Select
                      defaultSelectedKey={selectedEvent?.repeatInterval}
                      name="repeat"
                      className="flex flex-col gap-1"
                    >
                      <Label className="text-sm">Repeat</Label>
                      <Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <SelectValue className="block truncate" />
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Button>
                      <FieldError className="text-xs text-rose-500" />
                      <Popover className="z-10 mt-1 max-h-60 min-w-[30ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <ListBox
                          className="w-full focus:outline-none"
                          items={repeat}
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

                    <DatePicker
                      defaultValue={
                        selectedEvent?.startDate
                          ? fromDate(
                              new Date(selectedEvent.startDate),
                              getLocalTimeZone(),
                            )
                          : null
                      }
                      hideTimeZone
                      name="startDate"
                      granularity="day"
                      className="group flex flex-col gap-1"
                    >
                      <Label className="text-sm">Start Date</Label>
                      <Group className="relative flex w-full cursor-default items-center gap-2 rounded-md bg-white py-1.5 pl-3 pr-1 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <DateInput className="flex">
                          {(segment) => (
                            <DateSegment
                              segment={segment}
                              className="rounded-sm px-0.5 tabular-nums caret-transparent outline-none placeholder-shown:italic focus:bg-violet-700 focus:text-white"
                            />
                          )}
                        </DateInput>

                        <span className="flex-1" />
                        <Button className="flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </Button>
                      </Group>
                      <FieldError className="text-xs text-rose-500" />
                      <Popover className="z-10 mt-1 max-h-60 min-w-[30ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <Dialog className="p-6 text-gray-600">
                          <Calendar>
                            <header className="flex w-full items-center gap-1 px-1 pb-4 font-serif">
                              <Heading className="ml-2 flex-1 text-2xl font-semibold" />
                              <Button
                                className="flex h-9 w-9 cursor-default items-center justify-center rounded-full border-0 bg-transparent text-gray-600 outline-none ring-violet-600/70 ring-offset-2 hover:bg-gray-100 focus-visible:ring pressed:bg-gray-200"
                                slot="previous"
                              >
                                <ChevronLeftIcon />
                              </Button>
                              <Button
                                className="flex h-9 w-9 cursor-default items-center justify-center rounded-full border-0 bg-transparent text-gray-600 outline-none ring-violet-600/70 ring-offset-2 hover:bg-gray-100 focus-visible:ring pressed:bg-gray-200"
                                slot="next"
                              >
                                <ChevronRightIcon />
                              </Button>
                            </header>
                            <CalendarGrid className="border-separate border-spacing-1">
                              <CalendarGridHeader>
                                {(day) => (
                                  <CalendarHeaderCell className="text-xs font-semibold text-gray-500">
                                    {day}
                                  </CalendarHeaderCell>
                                )}
                              </CalendarGridHeader>
                              <CalendarGridBody>
                                {(date) => (
                                  <CalendarCell
                                    date={date}
                                    className="flex h-9 w-9 cursor-default items-center justify-center rounded-full outline-none ring-violet-600/70 ring-offset-2 outside-month:text-gray-300 hover:bg-gray-100 focus-visible:ring pressed:bg-gray-200 selected:bg-violet-700 selected:text-white"
                                  />
                                )}
                              </CalendarGridBody>
                            </CalendarGrid>
                          </Calendar>
                        </Dialog>
                      </Popover>
                    </DatePicker>

                    <DatePicker
                      defaultValue={
                        selectedEvent?.endDate
                          ? fromDate(
                              new Date(selectedEvent.endDate),
                              getLocalTimeZone(),
                            )
                          : null
                      }
                      hideTimeZone
                      granularity="day"
                      name="endDate"
                      className="group flex flex-col gap-1"
                    >
                      <Label className="text-sm">End Date</Label>
                      <Group className="relative flex w-full cursor-default items-center gap-2 rounded-md bg-white py-1.5 pl-3 pr-1 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <DateInput className="flex">
                          {(segment) => (
                            <DateSegment
                              segment={segment}
                              className="rounded-sm px-0.5 tabular-nums caret-transparent outline-none placeholder-shown:italic focus:bg-violet-700 focus:text-white"
                            />
                          )}
                        </DateInput>

                        <span className="flex-1" />
                        <Button className="flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </Button>
                      </Group>
                      <FieldError className="text-xs text-rose-500" />
                      <Popover className="z-10 mt-1 max-h-60 min-w-[30ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <Dialog className="p-6 text-gray-600">
                          <Calendar>
                            <header className="flex w-full items-center gap-1 px-1 pb-4 font-serif">
                              <Heading className="ml-2 flex-1 text-2xl font-semibold" />
                              <Button
                                className="flex h-9 w-9 cursor-default items-center justify-center rounded-full border-0 bg-transparent text-gray-600 outline-none ring-violet-600/70 ring-offset-2 hover:bg-gray-100 focus-visible:ring pressed:bg-gray-200"
                                slot="previous"
                              >
                                <ChevronLeftIcon />
                              </Button>
                              <Button
                                className="flex h-9 w-9 cursor-default items-center justify-center rounded-full border-0 bg-transparent text-gray-600 outline-none ring-violet-600/70 ring-offset-2 hover:bg-gray-100 focus-visible:ring pressed:bg-gray-200"
                                slot="next"
                              >
                                <ChevronRightIcon />
                              </Button>
                            </header>
                            <CalendarGrid className="border-separate border-spacing-1">
                              <CalendarGridHeader>
                                {(day) => (
                                  <CalendarHeaderCell className="text-xs font-semibold text-gray-500">
                                    {day}
                                  </CalendarHeaderCell>
                                )}
                              </CalendarGridHeader>
                              <CalendarGridBody>
                                {(date) => (
                                  <CalendarCell
                                    date={date}
                                    className="flex h-9 w-9 cursor-default items-center justify-center rounded-full outline-none ring-violet-600/70 ring-offset-2 outside-month:text-gray-300 hover:bg-gray-100 focus-visible:ring pressed:bg-gray-200 selected:bg-violet-700 selected:text-white"
                                  />
                                )}
                              </CalendarGridBody>
                            </CalendarGrid>
                          </Calendar>
                        </Dialog>
                      </Popover>
                    </DatePicker>
                    {errors && "form" in errors && errors.form && (
                      <div className="text-xs text-rose-500">{errors.form}</div>
                    )}
                    <Button
                      className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      type="submit"
                    >
                      <ArrowRightStartOnRectangleIcon className="w-4" />
                      Save
                    </Button>
                  </Form>
                  <deleteFetcher.Form
                    method="post"
                    action={`/event/${selectedEvent?.id}/delete`}
                    className="flex flex-col gap-3"
                  >
                    <Button
                      className="flex items-center gap-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                      type="submit"
                    >
                      <TrashIcon className="w-4" />
                      Delete event
                    </Button>
                  </deleteFetcher.Form>
                  <deleteDateFetcher.Form
                    method="post"
                    action={`/event/${selectedEvent?.id}/${selectedDate}/delete`}
                    className="flex flex-col gap-3"
                  >
                    <Button
                      className="flex items-center gap-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                      type="submit"
                    >
                      <TrashIcon className="w-4" />
                      Delete event for {selectedDate?.toString()}
                    </Button>
                  </deleteDateFetcher.Form>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <div className="flex flex-1 flex-col gap-2">
                    <span className="flex items-center gap-2">
                      <BookOpenIcon className="w-3" />
                      {
                        courses.find(
                          (course) => course.id === selectedEvent.courseId,
                        )?.name
                      }
                    </span>
                    <span className="flex items-center gap-2">
                      <BuildingOffice2Icon className="w-3" />
                      Αίθουσα{" "}
                      {
                        classrooms.find(
                          (classroom) =>
                            classroom.id === selectedEvent.classroomId,
                        )?.name
                      }
                    </span>
                    <span className="flex items-center gap-2">
                      <ClockIcon className="w-3" />
                      {new Date(selectedEvent.startDate).toLocaleDateString(
                        "el-GR",
                        {
                          weekday: "long",
                        },
                      )}{" "}
                      {selectedEvent.startTime.substring(0, 5)} -{" "}
                      {selectedEvent.endTime.substring(0, 5)}
                    </span>
                    {selectedEvent.repeatInterval === "daily" ? (
                      <span className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-3" />
                        Κάθε μέρα από {
                          selectedEvent.startDate.split("T")[0]
                        }{" "}
                        μέχρι {selectedEvent.endDate.split("T")[0]}
                      </span>
                    ) : selectedEvent.repeatInterval === "weekly" ? (
                      <span className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-3" />
                        Κάθε εβδομάδα από{" "}
                        {selectedEvent.startDate.split("T")[0]} μέχρι{" "}
                        {selectedEvent.endDate.split("T")[0]}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-3" />
                        Μονο για την ημερομηνία{" "}
                        {selectedEvent.startDate.split("T")[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex w-full items-center justify-end sm:hidden">
                    <Button
                      slot={null}
                      onPress={close}
                      className="flex w-full items-center gap-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                    >
                      <XMarkIcon className="w-5" /> Close
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
