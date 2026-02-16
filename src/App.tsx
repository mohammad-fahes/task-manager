import {
  Navigate,
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import { getSession, signOut } from "./lib/auth";
import { fetchMyPlan } from "./lib/api";
import type { Plan } from "./lib/api";

function Shell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();
  const inAuth = loc.pathname === "/login" || loc.pathname === "/register";
  const [authed, setAuthed] = useState<boolean | null>(null);

  // ✅ Phase 4: plan badge + locked premium links
  const [plan, setPlan] = useState<Plan>("free");

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setAuthed(!!s);

      if (s) {
        try {
          const p = await fetchMyPlan();
          setPlan(p);
        } catch {
          setPlan("free");
        }
      }
    })();
  }, [loc.pathname]);

  const logout = async () => {
    await signOut();
    nav("/login");
  };

  return (
    <div className="min-h-full bg-gray-50 text-gray-900">
      {!inAuth && (
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <Link to="/dashboard" className="font-bold">
              TaskManager
            </Link>

            <nav className="flex items-center gap-4 text-sm">
              <Link className="hover:underline" to="/dashboard">
                Dashboard
              </Link>

              <Link className="hover:underline" to="/projects">
                Projects
              </Link>

              <Link className="hover:underline" to="/settings">
                Settings
              </Link>

              {/* ✅ Analytics: locked for FREE */}
              {plan === "premium" ? (
                <Link className="hover:underline" to="/analytics">
                  Analytics
                </Link>
              ) : (
                <Link
                  className="flex items-center gap-1 text-gray-600 hover:underline"
                  to="/upgrade"
                  title="Premium feature"
                >
                  Analytics <span>🔒</span>
                </Link>
              )}

              {/* ✅ Upgrade link: show only for FREE */}
              {plan === "free" ? (
                <Link
                  className="font-semibold text-purple-700 hover:underline"
                  to="/upgrade"
                >
                  Upgrade
                </Link>
              ) : null}

              {/* ✅ Plan badge */}
              <span
                className={`ml-1 rounded-full px-2 py-1 text-xs font-semibold ${
                  plan === "premium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {plan === "premium" ? "PREMIUM" : "FREE"}
              </span>

              <button
                onClick={logout}
                className="rounded-lg border px-3 py-1 hover:bg-gray-50"
              >
                Logout
              </button>
            </nav>
          </div>
        </header>
      )}

      <main className={inAuth ? "" : "mx-auto max-w-5xl"}>{children}</main>

      {authed === false && !inAuth ? <Navigate to="/login" replace /> : null}
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/projects" element={<Projects />} />
        <Route path="/analytics" element={<Analytics />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/upgrade" element={<Upgrade />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Shell>
  );
}
