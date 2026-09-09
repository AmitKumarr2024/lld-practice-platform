import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

const navItems = [
  { to: "/problems", label: "Problems" },
  { to: "/history", label: "History" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const items = user?.role === "ADMIN" ? [...navItems, { to: "/admin", label: "Admin" }] : navItems;

  return (
    <div className="min-h-screen">
      {user && (
        <aside className="fixed left-0 top-0 flex h-full w-56 flex-col border-r border-line bg-panel/60 backdrop-blur-sm">
          <div className="border-b border-line px-5 py-5">
            <Link to="/" className="font-display text-sm font-semibold tracking-tight text-ink">
              LLD PRACTICE
            </Link>
            <p className="mt-0.5 font-mono text-[10px] tracking-wide text-muted">design bench</p>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
            {items.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 font-mono text-[12px] tracking-wide transition-colors ${
                    active ? "border-l-2 border-cyan bg-cyan/5 text-cyan" : "border-l-2 border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-line px-5 py-4">
            <p className="truncate text-xs font-medium text-ink">{user.name}</p>
            <p className="font-mono text-[10px] tracking-wide text-muted">{user.role.toLowerCase()}</p>
            <button
              onClick={handleLogout}
              className="mt-3 font-mono text-[11px] tracking-wide text-muted hover:text-danger"
            >
              sign out →
            </button>
          </div>
        </aside>
      )}

      <main className={user ? "ml-56 px-10 py-10" : "px-6 py-10"}>
        <div className="mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
