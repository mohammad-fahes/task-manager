import type { Task, TaskPriority, TaskStatus } from "../types";
import Subtasks from "./Subtasks";

type Props = {
  task: Task;
  projectName?: string;
  onUpdate: (id: string, patch: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const priorityBadge: Record<TaskPriority, string> = {
  low: "bg-green-50 text-green-700",
  medium: "bg-yellow-50 text-yellow-800",
  high: "bg-red-50 text-red-700",
};

export default function TaskCard({
  task,
  projectName,
  onUpdate,
  onDelete,
}: Props) {
  const toggleDone = async () => {
    const next: TaskStatus = task.status === "done" ? "todo" : "done";
    await onUpdate(task.id, { status: next });
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold">{task.title}</h3>

            <span
              className={`rounded-full px-2 py-1 text-xs ${priorityBadge[task.priority]}`}
            >
              {task.priority}
            </span>

            {projectName ? (
              <span className="rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-700">
                {projectName}
              </span>
            ) : null}

            {task.due_date ? (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                due {task.due_date}
              </span>
            ) : null}

            {task.pinned ? (
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                pinned
              </span>
            ) : null}
          </div>

          {task.description ? (
            <p className="mt-2 text-sm text-gray-600">{task.description}</p>
          ) : null}

          <p className="mt-2 text-xs text-gray-500">status: {task.status}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <button
            onClick={() => onUpdate(task.id, { pinned: !task.pinned })}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {task.pinned ? "Unpin" : "Pin"}
          </button>

          <button
            onClick={toggleDone}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {task.status === "done" ? "Mark todo" : "Mark done"}
          </button>

          <button
            onClick={() => onUpdate(task.id, { archived: true })}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Archive
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <Subtasks taskId={task.id} />
    </div>
  );
}





