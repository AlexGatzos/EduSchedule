import {
  PlusIcon,
  CheckIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/20/solid";
import { useState } from "react";
import type { ModalOverlayProps } from "react-aria-components";
import {
  ModalOverlay,
  Modal,
  Dialog,
  Heading,
  Form,
  Label,
  Button,
  ListBox,
  ListBoxItem,
  Input,
} from "react-aria-components";

export function CreateCourseModal(
  props: ModalOverlayProps &
    React.RefAttributes<HTMLDivElement> & {
      teachers: { teacher_id: number; id: number; fullName: string }[];
    },
) {
  let { teachers, isOpen, onOpenChange } = props;
  let [selectedTeachers, setSelectedTeachers] = useState(new Set());
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-10 bg-zinc-100 bg-opacity-30 backdrop-blur"
    >
      <Modal className="fixed bottom-0 right-0 top-0 w-96 border-l border-gray-400 bg-zinc-50 shadow-lg outline-none">
        <Dialog className="flex h-full w-full flex-col gap-4 p-4 focus:outline-none">
          {({ close }) => (
            <>
              <Heading
                slot="title"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <PlusIcon className="w-5" /> Create new Course
              </Heading>
              <Form
                action="/admin/courses/create"
                method="post"
                className="flex h-full flex-col gap-3"
              >
                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Course ID</span>
                  <Input
                    name="course_id"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Type</span>
                  <Input
                    name="type"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Name</span>
                  <Input
                    name="name"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Semester</span>
                  <Input
                    name="semester"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Teachers</span>
                </Label>
                <input
                  className="hidden"
                  name="teacherIds"
                  value={[...selectedTeachers.values()].join(",")}
                />
                <ListBox
                  onSelectionChange={(selected) => {
                    setSelectedTeachers(new Set(selected));
                  }}
                  disallowEmptySelection
                  selectionMode="multiple"
                  className="max-h-80 overflow-y-auto rounded border border-gray-300 bg-white p-1 shadow-sm outline-none focus:border-indigo-500 focus:ring-indigo-500"
                  items={teachers.map((teacher) => ({
                    key: teacher.teacher_id,
                    id: teacher.teacher_id,
                    fullName: teacher.fullName,
                  }))}
                >
                  {(item) => (
                    <ListBoxItem className="group flex cursor-default select-none items-center gap-2 rounded py-2 pl-2 pr-4 text-gray-900 outline-none focus:bg-indigo-600 focus:text-white">
                      {({ isSelected }) => (
                        <>
                          <span className="flex flex-1 items-center gap-3 truncate font-normal group-selected:font-medium">
                            {item.fullName}
                          </span>
                          {isSelected && (
                            <span className="flex w-5 items-center text-indigo-600 group-focus:text-white">
                              <CheckIcon className="w-5" />
                            </span>
                          )}
                        </>
                      )}
                    </ListBoxItem>
                  )}
                </ListBox>

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
