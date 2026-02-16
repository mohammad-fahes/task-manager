import type { TaskPriority, TaskStatus } from "../types";

type Props = {
  q: string;
  setQ: (v: string) => void;
  status: TaskStatus | "all";
  setStatus: (v: TaskStatus | "all") => void;
  priority: TaskPriority | "all";
  setPriority: (v: TaskPriority | "all") => void;
  sort: "due_date" | "created_at";
  setSort: (v: "due_date" | "created_at") => void;
};

export default function Filters(props: Props) {
  return (
    <div className="grid gap-3 rounded-2xl bg-white p-4 shadow sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="text-sm font-medium">Search</label>
        <input
          className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
          value={props.q}
          onChange={(e) => props.setQ(e.target.value)}
          placeholder="Search title…"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Status</label>
        <select
          className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
          value={props.status}
          onChange={(e) => props.setStatus(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Priority</label>
        <select
          className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
          value={props.priority}
          onChange={(e) => props.setPriority(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Sort</label>
        <select
          className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
          value={props.sort}
          onChange={(e) => props.setSort(e.target.value as any)}
        >
          <option value="due_date">Due date</option>
          <option value="created_at">Newest</option>
        </select>
      </div>
    </div>
  );
}
