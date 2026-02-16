import { supabase } from "./supabaseClient";
import type { Task, TaskPriority, TaskStatus } from "../types";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase env is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
    );
  }
}

export async function getUserId(): Promise<string> {
  requireSupabase();
  const { data, error } = await supabase!.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Not logged in");
  return data.user.id;
}

export async function fetchTasks(opts?: {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  q?: string;
  sort?: "due_date" | "created_at";
  projectId?: string | "all" | "none";
}): Promise<Task[]> {
  requireSupabase();
  const userId = await getUserId();

  let query = supabase!
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false);

  if (opts?.status && opts.status !== "all") query = query.eq("status", opts.status);
  if (opts?.priority && opts.priority !== "all") query = query.eq("priority", opts.priority);
  if (opts?.q && opts.q.trim()) query = query.ilike("title", `%${opts.q.trim()}%`);

  // ✅ Project filter
  if (opts?.projectId && opts.projectId !== "all") {
    if (opts.projectId === "none") query = query.is("project_id", null);
    else query = query.eq("project_id", opts.projectId);
  }

  query = query.order("pinned", { ascending: false });

  if (opts?.sort === "created_at") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("due_date", { ascending: true }).order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Task[];
}


export async function createTask(input: {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null; // YYYY-MM-DD or null
  project_id?: string | null;
}): Promise<Task> {
  requireSupabase();
  const userId = await getUserId();

  const { data, error } = await supabase!
    .from("tasks")
    .insert([
      {
        user_id: userId,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        priority: input.priority,
        due_date: input.due_date ?? null,
        project_id: input.project_id ?? null,

      },
    ])
    .select("*")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "description" | "status" | "priority" | "due_date" | "pinned" | "archived">>
): Promise<Task> {
  requireSupabase();

  const { data, error } = await supabase!
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  requireSupabase();
  const { error } = await supabase!.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
export async function fetchProjects() {
  const userId = await getUserId();
  const { data, error } = await supabase!
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createProject(name: string) {
  const userId = await getUserId();
  const { data, error } = await supabase!
    .from("projects")
    .insert({ name, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}
export async function fetchTags() {
  const userId = await getUserId();
  const { data, error } = await supabase!
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (error) throw error;
  return data;
}

export async function createTag(name: string) {
  const userId = await getUserId();
  const { data, error } = await supabase!
    .from("tags")
    .insert({ name, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}
export async function fetchSubtasks(taskId: string) {
  const { data, error } = await supabase!
    .from("subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("id");

  if (error) throw error;
  return data;
}

export async function createSubtask(taskId: string, title: string) {
  const { data, error } = await supabase!
    .from("subtasks")
    .insert({ task_id: taskId, title })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleSubtask(id: string, done: boolean) {
  const { data, error } = await supabase!
    .from("subtasks")
    .update({ done })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
export async function deleteProject(id: string) {
  const { error } = await supabase!.from("projects").delete().eq("id", id);
  if (error) throw error;
}
export type Plan = "free" | "premium";

export async function fetchMyPlan(): Promise<Plan> {
  requireSupabase();
  const userId = await getUserId();

  const { data, error } = await supabase!
    .from("users_profile")
    .select("plan")
    .eq("id", userId)
    .single();

  if (error) {
    // If profile row not created yet, default to free
    return "free";
  }

  return (data?.plan ?? "free") as Plan;
}
