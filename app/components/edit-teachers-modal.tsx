import {
  ArrowRightStartOnRectangleIcon,
  PencilSquareIcon,
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

export function EditTeacherModal(
  props: ModalOverlayProps &
    React.RefAttributes<HTMLDivElement> & {
      teacher: {
        id: number;
        fullName: string;
        role: string;
        teacher_id: number;
      };
    },
) {
  let { teacher, isOpen, onOpenChange } = props;

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
                <PencilSquareIcon className="w-5" /> {teacher.fullName}
              </Heading>
              <Form
                action={`/admin/teachers/${teacher.id}/update`}
                method="post"
                className="flex h-full flex-col gap-3"
              >
                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Full Name </span>
                  <Input
                    defaultValue={teacher.fullName}
                    name="fullName"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Role</span>
                  <Input
                    defaultValue={teacher.role}
                    name="role"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

                <Label className="flex flex-col gap-1">
                  <span className="text-sm">Teacher ID</span>
                  <Input
                    defaultValue={teacher.teacher_id}
                    name="teacher_id"
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </Label>

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
