import { BellAlertIcon } from "@heroicons/react/24/solid";
import { DynamicModelExtensionArgs } from "@prisma/client/runtime/library";
import type { ModalOverlayProps } from "react-aria-components";
import {
  ModalOverlay,
  Modal,
  Dialog,
  Heading,
  Button,
} from "react-aria-components";

export function DeleteEventModal(
  props: ModalOverlayProps &
    React.RefAttributes<HTMLDivElement> & {
      delete: void;
    },
) {
  let { delete: deleteAll, isOpen, onOpenChange } = props;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className={({ isEntering, isExiting }) => `
          fixed inset-0 z-10 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur
          ${isEntering ? "duration-300 ease-out animate-in fade-in" : ""}
          ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""}
        `}
    >
      <Modal
        className={({ isEntering, isExiting }) => `
            w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl
            ${isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""}
            ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}
          `}
      >
        <Dialog role="alertdialog" className="relative outline-none">
          {({ close }) => (
            <>
              <Heading
                slot="title"
                className="text-xxl my-0 font-semibold leading-6 text-slate-700"
              >
                Delete folder
              </Heading>
              <div className="absolute right-0 top-0 h-6 w-6 stroke-2 text-red-500">
                <BellAlertIcon />
              </div>
              <p className="mt-3 text-slate-500">
                Are you sure you want to delete "Documents"? All contents will
                be permanently destroyed.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  className="bg-slate-200 text-slate-800 hover:border-slate-300 pressed:bg-slate-300"
                  onPress={close}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-500 text-white hover:border-red-600 pressed:bg-red-600"
                  // Fix: Update the type of deleteAll prop
                  onPressUp={deleteAll}
                  onPress={close}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
