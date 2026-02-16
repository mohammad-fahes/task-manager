export type UserPlan = "free" | "premium";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null; // comes as YYYY-MM-DD from Supabase date
  pinned: boolean;
  archived: boolean;
  created_at: string;
  project_id: string | null;

};
export type Project = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Tag = {
  id: string;
  user_id: string;
  name: string;
};

export type Subtask = {
  id: string;
  task_id: string;
  title: string;
  done: boolean;
};
