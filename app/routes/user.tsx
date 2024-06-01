import { Fragment, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Bars3Icon,
  CalendarDaysIcon,
  BookOpenIcon,
  UserGroupIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { redirect } from "@remix-run/node"; // or cloudflare/deno

import {
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import Logo from "~/components/Logo";
import {
  Button,
  Dialog,
  Heading,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  Popover,
} from "react-aria-components";
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
  let logoutFetcher = useFetcher();
  let navigate = useNavigate();

  return (
    <>
      <header className="flex border-b border-gray-900/10 py-4">
        <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-x-3">
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
            <MenuTrigger>
              <Button className="relative flex rounded-full text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-500">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                {user.profile.profilePhoto ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user?.profile.profilePhoto}
                    alt="User avatar"
                  />
                ) : (
                  <UserCircleIcon className="h-10 w-10 rounded-full fill-indigo-500" />
                )}
              </Button>
              <Popover>
                <Menu className="z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem
                    className={
                      "block px-4 py-2 text-sm text-gray-700 active:bg-gray-100"
                    }
                    onAction={() => {
                      navigate("/user");
                    }}
                  >
                    Calendars
                  </MenuItem>
                  {user.profile.isAdmin && (
                    <MenuItem
                      className={
                        "block px-4 py-2 text-sm text-gray-700 active:bg-gray-100"
                      }
                      onAction={() => {
                        navigate("/admin");
                      }}
                    >
                      Admin
                    </MenuItem>
                  )}
                  <MenuItem
                    className={
                      "block px-4 py-2 text-sm text-gray-700 active:bg-gray-100"
                    }
                    onAction={() => {
                      logoutFetcher.submit(
                        {},
                        {
                          method: "POST",
                          action: "/auth/logout",
                        },
                      );
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
          </div>
        </div>
        <Modal isOpen={mobileMenuOpen}>
          <Dialog className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-4 pb-6 sm:max-w-sm sm:px-6 sm:ring-1 sm:ring-gray-900/10">
            <Heading className="hidden">Navigation</Heading>
            <div className="-ml-0.5 flex h-16 items-center gap-x-6">
              <Button
                className="-m-2.5 p-2.5 text-gray-700"
                onPress={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </Button>
              <div className="-ml-0.5">
                <NavLink to="/" className="flex-shrink-0">
                  <Logo />
                </NavLink>
              </div>
            </div>
            <ul className="mt-2 space-y-2">
              {secondaryNavigation
                .map((item) => {
                  // @TODO check if the current url matches the href
                  return { ...item, current: false };
                })
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
                          "h-5 w-5 shrink-0",
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  </li>
                ))}
            </ul>
          </Dialog>
        </Modal>
      </header>

      <div className=" max-w-full p-4 sm:p-16">
        <Outlet />
      </div>
    </>
  );
}
