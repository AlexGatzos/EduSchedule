import {
  PlusIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/20/solid";
import type { ModalOverlayProps } from "react-aria-components";
import {
  ModalOverlay,
  Modal,
  Dialog,
  Heading,
  Form,
  Label,
  Button,
  Input,
} from "react-aria-components";

export function CreateClassroomModal(
  props: ModalOverlayProps & React.RefAttributes<HTMLDivElement> & {},
) {
  let { isOpen, onOpenChange } = props;

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
                <PlusIcon className="w-5" /> Create new Classroom
              </Heading>
              <Form
                action="/admin/classrooms/create"
                method="post"
                className="flex h-full flex-col gap-3"
              >
                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Building</span>
                  <Input
                    name="building"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Capacity</span>
                  <Input
                    name="capacity"
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
                  <span className="text-sm">Equipment</span>
                  <Input
                    name="equipment"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

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
                    <ListBox
                      className="w-full focus:outline-none"
                      items={teachers}
                      selectionMode="multiple"
                    >
                      {(teacher) => (
                        <ListBoxItem className="group relative flex w-full cursor-default select-none items-center justify-between px-2 py-2 text-gray-900 aria-selected:font-semibold focus:bg-indigo-600 focus:text-white focus:outline-none">
                          {teacher.name}
                          <CheckIcon className="hidden w-4 text-emerald-500 group-aria-selected:block" />
                        </ListBoxItem>
                      )}
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
