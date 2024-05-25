import { Fragment, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  CalendarDaysIcon,
  BookOpenIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { redirect } from "@remix-run/node"; // or cloudflare/deno

import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import Logo from "~/components/Logo";
import { Button } from "react-aria-components";
import { authenticator } from "~/services/auth.server";

export async function loader(args: LoaderFunctionArgs) {
  let user = await authenticator.isAuthenticated(args.request);

  if (!user) {
    return redirect("/auth/login");
  }

  return { user };
}

const secondaryNavigation = [
  { name: "My Calendars", href: "/user/calendars", icon: CalendarDaysIcon },
  { name: "Courses", href: "/user/courses", icon: BookOpenIcon },
  { name: "Teachers", href: "/user/teachers", icon: UserGroupIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Admin() {
  let [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  let { user } = useLoaderData<typeof loader>();

  return (
    <>
      <header className="flex border-b border-gray-900/10 py-4">
        <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-x-6">
            <button
              type="button"
              className="-m-3 p-3 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-5 w-5 text-gray-900" aria-hidden="true" />
            </button>
            <NavLink to="/" className="flex-shrink-0">
              <Logo />
            </NavLink>
          </div>
          <nav className="hidden md:flex md:gap-x-11 md:text-sm md:font-semibold md:leading-6 md:text-gray-700">
            <ul className="flex list-none gap-x-8">
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "bg-gray-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                        "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold leading-6",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={classNames(
                            isActive
                              ? "text-indigo-600"
                              : "text-gray-400 group-hover:text-indigo-600",
                            "h-6 w-6 shrink-0",
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-x-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            ></button>
            <Menu as="div" className="relative ml-4 flex-shrink-0">
              <div>
                <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-12 w-12 rounded-full"
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
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right list-none rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                          href={`/admin`}
                          type="submit"
                        >
                          Admin
                        </a>
                      </div>
                    )}
                  </Menu.Item>

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
            </Menu>
          </div>
        </div>
        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-50" />
          <Dialog.Panel className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-4 pb-6 sm:max-w-sm sm:px-6 sm:ring-1 sm:ring-gray-900/10">
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
              {secondaryNavigation
                .map((item) => ({ ...item, current: false }))
                .map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                        "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold leading-6",
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-indigo-600"
                            : "text-gray-400 group-hover:text-indigo-600",
                          "h-6 w-6 shrink-0",
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  </li>
                ))}
            </ul>
          </Dialog.Panel>
        </Dialog>
      </header>

      <div className=" max-w-full px-16 pt-28">
        <Outlet />
      </div>
    </>
  );
}
