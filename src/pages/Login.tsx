import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../lib/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      await signIn(email.trim(), password);
      nav("/dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome back.</p>

        {err ? (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        <form className="mt-6 space-y-3" onSubmit={submit}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="w-full rounded-xl bg-black p-3 text-white hover:bg-black/90">
            Sign in
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          No account?{" "}
          <Link className="underline" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
