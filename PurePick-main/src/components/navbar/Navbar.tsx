"use client";
import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { Slack } from "lucide-react";
import { ThemeSwitcher } from "../theme-switcher/ThemeSwitcher";
import { useSession } from "next-auth/react";
import UserDropDown from "./UserDropDown";

const App = () => {
  const { data: session, status } = useSession();
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/feedback", label: "Feedback" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
  ];

  return (
    <Navbar maxWidth="full" className="border-b border-gray-200 bg-white/80 dark:border-zinc-900 dark:bg-black/80 backdrop-blur-md">
      <NavbarContent>
        <NavbarBrand className="flex gap-1">
          <Link className="text-inherit flex gap-1" href="/">
            <Slack size={30} />
            <p className="font-bold text-inherit text-xl">NutriLens</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden md:flex gap-6" justify="center">
        {navLinks.map((item) => (
          <NavbarItem key={item.href}>
            <Link className="text-base font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" href={item.href}>
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
        {status === "loading" ? (<div></div>) :
          (
            status === "authenticated" ? (
              <UserDropDown />
            ) : (
              <>
                <NavbarItem className="hidden lg:flex">
                  <Link href="/login">Login</Link>
                </NavbarItem>
                <NavbarItem>
                  <Button as={Link} color="primary" href="/signup" variant="flat">
                    Sign Up
                  </Button>
                </NavbarItem>
              </>
            )
          )
        }
      </NavbarContent >
    </Navbar >
  );
}

export default App;
