export type Plan = "free" | "premium";

export type Feature =
  | "reminders"
  | "export"
  | "workspaces"
  | "teams"
  | "unlimited_tasks"
  | "multiple_projects";

export function canUseFeature(plan: Plan, feature: Feature) {
  if (plan === "premium") return true;

  // FREE rules
  if (feature === "multiple_projects") return false;
  if (feature === "unlimited_tasks") return false;
  if (feature === "reminders") return false;
  if (feature === "export") return false;
  if (feature === "workspaces") return false;
  if (feature === "teams") return false;

  return true;
}

export function checkLimit(
  plan: Plan,
  resource: "tasks" | "projects",
  currentCount: number
) {
  if (plan === "premium") return { ok: true };

  if (resource === "tasks" && currentCount >= 20) {
    return { ok: false, reason: "Free plan: max 20 active tasks." };
  }
  if (resource === "projects" && currentCount >= 1) {
    return { ok: false, reason: "Free plan: max 1 project." };
  }
  return { ok: true };
}
