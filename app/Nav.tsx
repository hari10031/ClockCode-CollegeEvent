"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [["/leaderboard", "Leaderboard"], ["/admin", "Timer settings"]];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="top glass">
      <Link href="/" className="brand">Python Coding Clock</Link>
      <nav aria-label="Main">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
