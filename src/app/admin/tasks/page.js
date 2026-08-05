import { AdminBadge, AdminCard, PageHeader } from "../components";
import { fetchAdminDashboardData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

function getTaskGroup(task) {
  const dueAt = task.due_at ? new Date(task.due_at) : null;
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (!dueAt) {
    return "Upcoming";
  }

  if (dueAt.getTime() < Date.now()) {
    return "Overdue";
  }

  if (dueAt <= today) {
    return "Due today";
  }

  return "Upcoming";
}

export default async function TasksPage() {
  const data = await fetchAdminDashboardData();
  const groups = ["Overdue", "Due today", "Upcoming"].map((group) => ({
    group,
    tasks: data.tasks.filter((task) => getTaskGroup(task) === group)
  }));

  return (
    <>
      <PageHeader
        title="Tasks"
        body="Boarding passes, 24-hour reminders, payment follow-ups, callbacks, and document work."
      />
      <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-3">
        {groups.map(({ group, tasks }) => (
          <AdminCard key={group} className="p-5">
            <h2 className="text-lg font-semibold">{group}</h2>
            <div className="mt-4 space-y-3">
              {tasks.length === 0 && <p className="text-sm text-ink/55">No tasks in this lane.</p>}
              {/* Recessed, not raised. These sit inside an AdminCard, and a second
                  elevated surface on top of the first reads as a card in a card. */}
              {tasks.map((task) => (
                <div key={task.id} className="rounded-md bg-ink/[0.035] p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.task_type}</p>
                      <p className="text-sm text-ink/55">{task.customers?.name ?? "Unknown"} · {task.due_at?.slice(0, 10)}</p>
                    </div>
                    {/* `danger` is not one of AdminBadge's tones (default/good/warn/
                        critical), so urgent tasks were resolving to undefined and
                        rendering with no colour at all — the one priority that needed
                        to stand out was the only one that did not. */}
                    <AdminBadge tone={task.priority === "urgent" ? "critical" : "warn"}>
                      {task.priority}
                    </AdminBadge>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
