import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { Panel } from "../components/Panel";
import { Button } from "../components/Button";

export function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    await login(email, password);
    navigate("/problems");
  }

  function fillDemo(role) {
    if (role === "LEARNER") {
      setEmail("learner@demo.com");
      setPassword("learner123");
    } else {
      setEmail("admin@demo.com");
      setPassword("admin123");
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="mb-8 text-center">
        <p className="font-mono text-[11px] tracking-widest text-cyan">SESSION / AUTH</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Sign in to the bench</h1>
      </div>

      <Panel>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-muted">email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-cyan focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-muted">password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-cyan focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="font-mono text-xs text-danger">error — {error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "authenticating..." : "Enter workspace"}
          </Button>
        </form>
      </Panel>

      <div className="mt-6 flex items-center justify-center gap-4 font-mono text-[11px] tracking-wide text-muted">
        <button onClick={() => fillDemo("LEARNER")} className="hover:text-cyan">
          fill learner demo
        </button>
        <span>/</span>
        <button onClick={() => fillDemo("ADMIN")} className="hover:text-cyan">
          fill admin demo
        </button>
      </div>
    </div>
  );
}
