import { useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  fetchProjects,
} from "../lib/api";
import type { Task, TaskPriority, TaskStatus } from "../types";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [sort, setSort] = useState<"due_date" | "created_at">("due_date");

  /* ======================
     PHASE 4 – USAGE COUNTERS
     ====================== */
  const TASK_LIMIT = 20;
  const PROJECT_LIMIT = 1;

  const activeTasksCount = tasks.length;
  const projectsCount = projects.length;

  /* ======================
     QUERY KEY (FIXED)
     ====================== */
  const queryKey = useMemo(
    () => JSON.stringify({ q, status, priority, sort, projectId }),
    [q, status, priority, sort, projectId]
  );

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await fetchTasks({
        q,
        status,
        priority,
        sort,
        projectId,
      });
      setTasks(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Reload tasks when filters change
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  // Load projects once
  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((e) => console.error("Failed to load projects", e));
  }, []);

  const onCreate = async (input: any) => {
    const newTask = await createTask(input);
    setTasks((prev) => [newTask, ...prev]);
  };

  const onUpdate = async (id: string, patch: any) => {
    const updated = await updateTask(id, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const onDelete = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const projectMap = new Map(projects.map((p: any) => [p.id, p.name]));

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* USAGE COUNTERS */}
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <div
            className={`rounded-xl px-3 py-1 ${
              activeTasksCount >= TASK_LIMIT
                ? "bg-red-100 text-red-700"
                : activeTasksCount >= 15
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100"
            }`}
          >
            Tasks: {activeTasksCount} / {TASK_LIMIT}
          </div>

          <div
            className={`rounded-xl px-3 py-1 ${
              projectsCount >= PROJECT_LIMIT
                ? "bg-red-100 text-red-700"
                : "bg-gray-100"
            }`}
          >
            Projects: {projectsCount} / {PROJECT_LIMIT}
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <Filters
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        sort={sort}
        setSort={setSort}
      />

      {/* CREATE TASK */}
      <TaskForm onCreate={onCreate} projects={projects} />

      {/* PROJECT FILTER */}
      <div className="rounded-2xl bg-white p-4 shadow">
        <label className="text-sm font-medium">Project</label>
        <select
          className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="all">All projects</option>
          <option value="none">No project</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* TASK LIST */}
      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onUpdate={onUpdate}
        onDelete={onDelete}
        projectMap={projectMap}
      />
    </div>
  );
}
