import { NavLink, Outlet } from "react-router"

// NavLink gives us an { isActive } flag so we can highlight the current tab.
function navClass({ isActive }: { isActive: boolean }) {
  return (
    "flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors " +
    (isActive
      ? "bg-background text-foreground shadow-sm"
      : "text-muted-foreground hover:text-foreground")
  )
}

export default function Layout() {
  return (
    <main className="min-h-screen bg-muted/30 py-10">
      <div className="mx-auto max-w-xl space-y-6 px-4">
        <header className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">Shared Tab</h1>
          <nav className="flex gap-1 rounded-lg bg-muted p-1">
            {/* `end` => only active on an EXACT match, so "/" isn't active on "/expenses" */}
            <NavLink to="/" end className={navClass}>
              People
            </NavLink>
            <NavLink to="/expenses" className={navClass}>
              Expenses
            </NavLink>
          </nav>
        </header>

        {/* The matched child route renders here. The layout stays mounted across nav. */}
        <Outlet />
      </div>
    </main>
  )
}
