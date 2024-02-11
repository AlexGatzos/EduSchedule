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
  Section,
  Collection,
  ListBox,
  ListBoxItem,
  Header,
  FileTrigger,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { useState } from "react";
import { CreateClassroomModal } from "~/components/create-classroom-modal";
import { EditClassroomModal } from "~/components/edit-classroom-modal";
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

  const classrooms = await prisma.classroom.findMany();

  let classroomBySemester = classrooms.reduce(
    (acc, classroom) => {
      if (classroom.building in acc) {
        acc[classroom.building].push(classroom);
      } else {
        acc[classroom.building] = [classroom];
      }
      return acc;
    },
    {} as Record<string, typeof classrooms>,
  );

  let allClassrooms = Object.entries(classroomBySemester).map(
    ([building, classrooms]) => {
      return {
        id: building,
        building,
        classrooms,
      };
    },
  );

  return json({ allClassrooms, classrooms });
}

export default function Classroom() {
  let { allClassrooms, classrooms } = useLoaderData<typeof loader>();

  let [isNewClassroomModalOpen, setIsNewClassroomModalOpen] = useState(false);
  let [classroomId, setClassroomId] = useState<number | null>(null);
  let uploadCSVFetcher = useFetcher();
  let deleteAllCoursesFetcher = useFetcher();
  let deleteCourseFetcher = useFetcher();

  let selectedClassroom = classroomId
    ? classrooms.find((c) => c.id === classroomId)
    : null;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-2">
          <Heading className="text-2xl font-bold">Classrooms</Heading>
          <div className="flex items-center gap-2">
            <Button
              slot={null}
              onPress={() => setIsNewClassroomModalOpen(true)}
              type="button"
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="w-4" /> Add Classrooms
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
                          Upload a CSV file to add multiple classrooms at once.
                          The CSV should have the following columns:
                        </p>
                        <ExampleTable
                          columns={[
                            "building",
                            "capacity",
                            "name",
                            "equipment",
                          ]}
                          examples={[
                            ["Πληροφορικη", "24", "101", "Pc"],
                            ["Πληροφορικη", "24", "101", "Pc"],
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
                              action: "/admin/classrooms/upload",
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
                deleteAllCoursesFetcher.submit(null, {
                  method: "DELETE",
                  action: "/admin/classrooms/delete",
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
          items={allClassrooms}
        >
          {(buldingWithClassrooms) => (
            <Section
              className="flex flex-col divide-y border"
              key={buldingWithClassrooms.id}
            >
              <Header className="px-2 py-4 text-lg font-semibold">
                Κτήριο {buldingWithClassrooms.building}
              </Header>
              <Collection items={buldingWithClassrooms.classrooms}>
                {(classroom) => (
                  <ListBoxItem
                    className="flex items-center justify-between gap-2 px-2 py-3"
                    key={classroom.id}
                  >
                    <span className="flex truncate text-sm font-medium text-gray-900">
                      Αίθουσα {classroom.name}
                    </span>
                    <span className="text-xs text-gray-800">
                      Χωρητικότητα {classroom.capacity} άτομα
                    </span>
                    <div className="flex items-center gap-2">
                      <Button onPress={() => setClassroomId(classroom.id)}>
                        <PencilSquareIcon className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button
                        onPress={() => {
                          deleteCourseFetcher.submit(null, {
                            method: "DELETE",
                            action: `/admin/classrooms/${classroom.id}/delete`,
                          });
                        }}
                      >
                        <TrashIcon className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </ListBoxItem>
                )}
              </Collection>
            </Section>
          )}
        </ListBox>
      </div>

      <CreateClassroomModal
        isOpen={isNewClassroomModalOpen}
        onOpenChange={setIsNewClassroomModalOpen}
      />

      {selectedClassroom && (
        <EditClassroomModal
          isOpen={classroomId !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setClassroomId(null);
            }
          }}
          classroom={selectedClassroom}
        />
      )}
    </>
  );
}
