import { useEffect, useState } from "react";
import { createSubtask, fetchSubtasks, toggleSubtask } from "../lib/api";
import type { Subtask } from "../types";

export default function Subtasks({ taskId }: { taskId: string }) {
  const [items, setItems] = useState<Subtask[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchSubtasks(taskId).then(setItems);
  }, [taskId]);

  const add = async () => {
    if (!title.trim()) return;
    const s = await createSubtask(taskId, title.trim());
    setItems((p) => [...p, s]);
    setTitle("");
  };

  const toggle = async (s: Subtask) => {
    const updated = await toggleSubtask(s.id, !s.done);
    setItems((p) => p.map((x) => (x.id === s.id ? updated : x)));
  };

  return (
    <div className="mt-3 rounded-xl border p-3">
      <h4 className="text-sm font-semibold mb-2">Subtasks</h4>

      <div className="space-y-2">
        {items.map((s) => (
          <label key={s.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={s.done} onChange={() => toggle(s)} />
            <span className={s.done ? "line-through text-gray-400" : ""}>
              {s.title}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded-lg border p-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New subtask…"
        />
        <button onClick={add} className="rounded-lg border px-3 text-sm">
          Add
        </button>
      </div>
    </div>
  );
}
