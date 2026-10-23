"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/content", label: "Content" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="relative z-10 bg-[#FFFAFA] shadow-md">
      <nav className="flex h-16 items-center justify-between px-6 md:px-16">
        <Link href="/" aria-label="Mediaponics home" className="flex items-center">
          <Image
            src="/mediaponics_logo.png"
            alt="Mediaponics"
            width={160}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <ul className="flex items-center gap-4 text-sm font-semibold md:gap-8">
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`pb-1 hover:underline ${
                    active ? "border-b-2 border-black" : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
