import {
  PlusIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/20/solid";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
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
  TextField,
  FieldError,
} from "react-aria-components";
import type { ActionData } from "~/routes/admin.classrooms.create";

export function CreateClassroomModal(
  props: ModalOverlayProps & React.RefAttributes<HTMLDivElement> & {},
) {
  let { isOpen, onOpenChange } = props;
  let { state, data, submit } = useFetcher<ActionData>();
  let errors = data && "errors" in data ? data.errors : undefined;

  useEffect(() => {
    if (data && !errors && state !== "idle") {
      onOpenChange?.(false);
    }
  }, [data, errors, onOpenChange, state]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-10 bg-zinc-100 bg-opacity-30 backdrop-blur"
    >
      <Modal className="fixed bottom-0 right-0 top-0 border-l border-gray-400 bg-zinc-50 shadow-lg outline-none sm:w-96">
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
                validationErrors={errors}
                className="flex h-full flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(e.currentTarget);
                }}
              >
                <TextField
                  className="flex flex-col gap-1"
                  name="name"
                  type="text"
                  isRequired
                >
                  <Label>
                    <span className="text-sm">Name</span>
                  </Label>
                  <Input className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  <FieldError className="text-xs text-rose-500" />
                </TextField>

                <TextField
                  className="flex flex-col gap-1"
                  name="building"
                  type="text"
                  isRequired
                >
                  <Label>
                    <span className="text-sm">Building</span>
                  </Label>
                  <Input className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  <FieldError className="text-xs text-rose-500" />
                </TextField>

                <TextField
                  className="flex flex-col gap-1"
                  name="capacity"
                  type="text"
                  isRequired
                >
                  <Label>
                    <span className="text-sm">Capacity</span>
                  </Label>
                  <Input className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  <FieldError className="text-xs text-rose-500" />
                </TextField>

                <TextField
                  className="flex flex-col gap-1"
                  name="equipment"
                  type="text"
                  isRequired
                >
                  <Label>
                    <span className="text-sm">Equipment</span>
                  </Label>
                  <Input className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  <FieldError className="text-xs text-rose-500" />
                </TextField>

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
