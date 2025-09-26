import NavbarUser from "./nabarUser";

export default function Navbar() {
  return (
    <header className="flex flex-row justify-between h-16 shrink-0 items-center gap-2 shadow bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 px-4 font-bold text-2xl">
        <span className="bg-gradient-to-r from-sky-500 via-purple-500 to-violet-600 bg-clip-text text-transparent">
          SaaS Boilerplate
        </span>
      </div>
      <NavbarUser />
    </header>
  );
}
