import { NavLink, Outlet } from "react-router";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/news", label: "News" },
  { to: "/events", label: "Events" },
  { to: "/visit", label: "Visitor Guide" },
];

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-maroon-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <a href="/" className="leading-tight">
            <span className="block font-serif text-2xl font-semibold text-maroon-800">
              Karsha Chamling Monastery
            </span>
            <span className="block text-sm text-stone-500">Zanskar, Ladakh</span>
          </a>
          <nav className="flex flex-wrap gap-1 text-sm font-medium">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 transition ${
                    isActive ? "bg-maroon-700 text-white" : "text-stone-700 hover:bg-maroon-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 bg-maroon-900 text-maroon-100">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
          <p className="font-serif text-lg text-white">Karsha Chamling Monastery</p>
          <p className="mt-1">Karsha, Zanskar, Union Territory of Ladakh, India</p>
          <p className="mt-4 text-maroon-100/70">
            © {new Date().getFullYear()} Karsha Chamling Monastery
          </p>
        </div>
      </footer>
    </div>
  );
}
