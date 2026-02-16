import { useEffect, useState } from "react";
import { createProject, deleteProject, fetchProjects } from "../lib/api";

type Project = { id: string; name: string };

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const data = await fetchProjects();
      setProjects(data as any);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load projects");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    setErr("");
    if (!name.trim()) return;
    try {
      const p = await createProject(name.trim());
      setProjects((prev) => [...prev, p as any]);
      setName("");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create project");
    }
  };

  const remove = async (id: string) => {
    setErr("");
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete project");
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Projects</h1>

      {err ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="rounded-2xl bg-white p-4 shadow space-y-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border p-3 outline-none focus:ring"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name (e.g. School)"
          />
          <button onClick={add} className="rounded-xl bg-black px-4 text-white">
            Add
          </button>
        </div>

        <div className="divide-y">
          {projects.length === 0 ? (
            <div className="py-3 text-sm text-gray-500">No projects yet.</div>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="font-medium">{p.name}</div>
                <button
                  onClick={() => remove(p.id)}
                  className="rounded-lg border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
