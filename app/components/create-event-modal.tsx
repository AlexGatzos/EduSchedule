import {
  PlusIcon,
  ChevronUpDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/20/solid";
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
  Collection,
  Header,
  Section,
  Input,
} from "react-aria-components";

export function CreateEventModal(
  props: ModalOverlayProps &
    React.RefAttributes<HTMLDivElement> & {
      courses: { id: number; name: string; semester: string }[];
      classrooms: { id: number; name: string }[];
      repeat: { id: string; name: string }[];
      selectedDate?: DateValue | null;
      allCourses: {
        id: string;
        semester: string;
        courses: {
          id: number;
          course_id: number;
          name: string;
          type: string;
          semester: string;
        }[];
      }[];
    },
) {
  let { allCourses, classrooms, repeat, selectedDate, isOpen, onOpenChange } =
    props;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 bg-zinc-100 bg-opacity-30 backdrop-blur"
    >
      <Modal className="fixed bottom-0 right-0 top-0 w-96 border-l border-gray-400 bg-zinc-50 shadow-lg outline-none">
        <Dialog className="flex h-full w-full flex-col gap-4 p-4 focus:outline-none">
          {({ close }) => (
            <>
              <Heading
                slot="title"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <PlusIcon className="w-5" /> Create new Event
              </Heading>
              <Form
                action="/?index"
                method="post"
                className="flex h-full flex-col gap-3"
              >
                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Name</span>
                  <Input
                    name="name"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

                <Select name="courseId" className="flex flex-col gap-1">
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
                  <Popover className="z-10 mt-1 max-h-40 min-w-[20ch] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <ListBox className="rounded border" items={allCourses}>
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
                                  {course.type} -
                                </span>
                                <span className="flex-1 truncate text-sm font-medium text-gray-900">
                                  {course.name}
                                </span>
                                <div className="flex items-center gap-2"></div>
                              </ListBoxItem>
                            )}
                          </Collection>
                        </Section>
                      )}
                    </ListBox>
                  </Popover>
                </Select>

                <Select name="classroomId" className="flex flex-col gap-1">
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
                    <TimeField name="startTime">
                      <DateInput className="flex w-auto items-center whitespace-nowrap ">
                        {(segment) => <DateSegment segment={segment} />}
                      </DateInput>
                      <Text slot="description" />
                      <FieldError />
                    </TimeField>
                    <TimeField name="endTime">
                      <DateInput className="flex w-auto items-center whitespace-nowrap ">
                        {(segment) => <DateSegment segment={segment} />}
                      </DateInput>
                      <Text slot="description" />
                      <FieldError />
                    </TimeField>
                  </div>
                </div>

                <Select name="repeat" className="flex flex-col gap-1">
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
                  name="startDate"
                  value={selectedDate}
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
                {/* <Select name="teachers" className="flex flex-col gap-1">
                    <Label className="text-sm">Teachers</Label>
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
                      <ListBox className="w-full focus:outline-none">
                        <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 focus:bg-indigo-600 focus:text-white focus:outline-none aria-selected:font-semibold">
                          <span>Mathematics</span>
                          <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                        </ListBoxItem>
                        <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 focus:bg-indigo-600 focus:text-white focus:outline-none aria-selected:font-semibold">
                          <span>Mathematics 1</span>
                          <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                        </ListBoxItem>
                        <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 focus:bg-indigo-600 focus:text-white focus:outline-none aria-selected:font-semibold">
                          <span>Mathematics 2</span>
                          <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                        </ListBoxItem>
                        <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 focus:bg-indigo-600 focus:text-white focus:outline-none aria-selected:font-semibold">
                          <span>Mathematics 3</span>
                          <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                        </ListBoxItem>
                      </ListBox>
                    </Popover>
                  </Select> */}

                <Button
                  className="flex items-center gap-2 justify-self-end rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  type="submit"
                >
                  <ArrowRightStartOnRectangleIcon className="w-4" />
                  Save
                </Button>
              </Form>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
