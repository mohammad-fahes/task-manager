import { useState } from "react";
import type { TaskPriority, TaskStatus } from "../types";

type Props = {
  onCreate: (input: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string | null;
    project_id?: string | null;
  }) => Promise<void>;
  projects: { id: string; name: string }[];
};

export default function TaskForm({ onCreate, projects }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [due, setDue] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!title.trim()) return setErr("Title is required.");

    setBusy(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        status,
        priority,
        due_date: due ? due : null,
        project_id: projectId ? projectId : null,
      });

      // reset form
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setDue("");
      setProjectId("");
    } catch (e: any) {
      const msg = e?.message ?? "Failed to create task";

      // ✅ Phase 4 – FREE plan limit handling
      if (msg.includes("FREE_LIMIT_TASKS")) {
        setErr(
          "Free plan limit reached (20 active tasks). Upgrade to Premium to add more."
        );
        return;
      }

      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">New task</h2>
      </div>

      {err ? (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Title</label>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finish homework"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Description (optional)</label>
          <textarea
            className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add details…"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Project</label>
          <select
            className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Priority</label>
          <select
            className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Due date</label>
          <input
            className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </div>

        <div className="flex items-end sm:col-span-2">
          <button
            disabled={busy}
            className="w-full rounded-xl bg-black p-3 text-white hover:bg-black/90 disabled:opacity-60"
          >
            {busy ? "Creating..." : "Create task"}
          </button>
        </div>
      </div>
    </form>
  );
}

