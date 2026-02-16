import { useEffect, useMemo, useState } from "react";
import { fetchMyPlan, fetchTasks } from "../lib/api";
import type { Plan } from "../lib/api";
import type { Task } from "../types";

function LockIcon() {
  return (
    <span aria-hidden className="inline-flex items-center justify-center">
      🔒
    </span>
  );
}

export default function Analytics() {
  const [plan, setPlan] = useState<Plan>("free");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const p = await fetchMyPlan();
        setPlan(p);

        if (p === "premium") {
          const t = await fetchTasks({ status: "all", priority: "all", sort: "created_at", q: "" });
          setTasks(t);
        }
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const active = tasks; // your fetchTasks already filters archived=false
    const total = active.length;
    const done = active.filter((t) => t.status === "done").length;
    const pinned = active.filter((t) => t.pinned).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueSoonEnd = new Date(today);
    dueSoonEnd.setDate(dueSoonEnd.getDate() + 7);

    const overdue = active.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      d.setHours(0, 0, 0, 0);
      return d < today && t.status !== "done";
    }).length;

    const dueSoon = active.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      d.setHours(0, 0, 0, 0);
      return d >= today && d <= dueSoonEnd && t.status !== "done";
    }).length;

    const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, done, pinned, overdue, dueSoon, completionRate };
  }, [tasks]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-700">{err}</div>;

  // 🔒 Premium gate
  if (plan !== "premium") {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <LockIcon /> Premium feature
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Upgrade to Premium to unlock Analytics (completion rate, overdue, due soon, and more).
          </p>
          <a
            href="/upgrade"
            className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-white hover:bg-black/90"
          >
            Go to Upgrade
          </a>
        </div>
      </div>
    );
  }

  // Premium view
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">Quick insights about your tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Active tasks" value={stats.total} />
        <Card title="Done tasks" value={stats.done} />
        <Card title="Completion rate" value={`${stats.completionRate}%`} />
        <Card title="Overdue" value={stats.overdue} />
        <Card title="Due soon (7d)" value={stats.dueSoon} />
        <Card title="Pinned" value={stats.pinned} />
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Completion bar</h2>
        <div className="mt-3 h-3 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-3 bg-black"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {stats.done} done out of {stats.total} tasks.
        </p>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
