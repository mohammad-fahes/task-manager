import type { Task } from "../types";
import TaskCard from "./TaskCard";

type Props = {
  tasks: Task[];
  loading: boolean;
  error: string;
  onUpdate: (id: string, patch: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  projectMap?: Map<string, string>;
};

export default function TaskList({
  tasks,
  loading,
  error,
  onUpdate,
  onDelete,
  projectMap, // ✅ ADD THIS
}: Props) {
  if (loading)
    return <div className="rounded-2xl bg-white p-4 shadow">Loading…</div>;

  if (error)
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-red-700 shadow">
        {error}
      </div>
    );

  if (!tasks.length) {
    return <div className="rounded-2xl bg-white p-4 shadow">No tasks yet.</div>;
  }

  return (
    <div className="grid gap-3">
      {tasks.map((t) => (
        <TaskCard
          key={t.id}
          task={t}
          onUpdate={onUpdate}
          onDelete={onDelete}
          projectName={projectMap?.get(t.project_id ?? "")} // ✅ PASS IT HERE
        />
      ))}
    </div>
  );
}


