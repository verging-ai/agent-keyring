import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Overview", to: "/" },
  { label: "Providers", to: "/providers" },
  { label: "Clients", to: "/clients" },
  { label: "Sync", to: "/sync" },
  { label: "Settings", to: "/settings" }
];

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-kicker">Local-first desktop</div>
          <h1>AgentKeyring</h1>
          <p>Manage keys once, validate them, and sync local AI tools safely.</p>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-note">
          <strong>MVP focus</strong>
          <span>Providers, discovery, sync safety, and clear feedback.</span>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}

