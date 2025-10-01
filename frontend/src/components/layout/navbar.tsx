import LogoText from "./logoText";
import NavbarUser from "./nabarUser";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex flex-row justify-between h-16 shrink-0 items-center gap-2 shadow bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 px-4 font-bold text-2xl">
        <Link href="/dashboard" className="hover:scale-105 transition-all duration-200">
          <LogoText />
        </Link>
      </div>
      <NavbarUser />
    </header>
  );
}
