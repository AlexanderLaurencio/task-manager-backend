import { Database } from "sqlite3";
import { TaskProps } from "../types/types.js";
import { insertTask } from "../db/queries/queries.js";

const tasks: TaskProps[] = [
  {
    task_title: "Finish backend API",
    task_description: "Implement CRUD endpoints for tasks.",
    task_status: "inProgress",
    task_priority: "high",
    task_due_date: "2026-08-01"
  },
  {
    task_title: "Write unit tests",
    task_description: "Test all database functions.",
    task_status: "pending",
    task_priority: "medium",
    task_due_date: "2026-08-02"
  },
  {
    task_title: "Update documentation",
    task_description: "Document API routes.",
    task_status: "pending",
    task_priority: "low",
    task_due_date: "2026-08-03"
  },
  {
    task_title: "Fix login bug",
    task_description: "Resolve session expiration issue.",
    task_status: "completed",
    task_priority: "high",
    task_due_date: "2026-07-28"
  },
  {
    task_title: "Optimize SQL queries",
    task_description: "Reduce query execution time.",
    task_status: "inProgress",
    task_priority: "high",
    task_due_date: "2026-08-04"
  },
  {
    task_title: "Design dashboard",
    task_description: "Create dashboard layout.",
    task_status: "pending",
    task_priority: "medium",
    task_due_date: "2026-08-05"
  },
  {
    task_title: "Implement search",
    task_description: "Add search by title.",
    task_status: "pending",
    task_priority: "medium",
    task_due_date: "2026-08-06"
  },
  {
    task_title: "Add pagination",
    task_description: "Limit API results.",
    task_status: "pending",
    task_priority: "low",
    task_due_date: "2026-08-07"
  },
  {
    task_title: "Review pull requests",
    task_description: "Review teammates' code.",
    task_status: "completed",
    task_priority: "medium",
    task_due_date: "2026-07-30"
  },
  {
    task_title: "Refactor controllers",
    task_description: "Simplify controller logic.",
    task_status: "inProgress",
    task_priority: "high",
    task_due_date: "2026-08-08"
  },
  {
    task_title: "Setup CI/CD",
    task_description: "Automate deployments.",
    task_status: "pending",
    task_priority: "high",
    task_due_date: "2026-08-10"
  },
  {
    task_title: "Add dark mode",
    task_description: "Implement theme switching.",
    task_status: "pending",
    task_priority: "low",
    task_due_date: "2026-08-11"
  },
  {
    task_title: "Create user profile",
    task_description: "Build profile page.",
    task_status: "inProgress",
    task_priority: "medium",
    task_due_date: "2026-08-12"
  },
  {
    task_title: "Validate forms",
    task_description: "Improve client-side validation.",
    task_status: "completed",
    task_priority: "high",
    task_due_date: "2026-07-29"
  },
  {
    task_title: "Add notifications",
    task_description: "Notify users of updates.",
    task_status: "pending",
    task_priority: "medium",
    task_due_date: "2026-08-13"
  },
  {
    task_title: "Backup database",
    task_description: "Create daily backup script.",
    task_status: "completed",
    task_priority: "high",
    task_due_date: "2026-07-27"
  },
  {
    task_title: "Improve accessibility",
    task_description: "Add ARIA labels.",
    task_status: "pending",
    task_priority: "medium",
    task_due_date: "2026-08-14"
  },
  {
    task_title: "Clean CSS",
    task_description: "Remove unused styles.",
    task_status: "inProgress",
    task_priority: "low",
    task_due_date: "2026-08-15"
  },
  {
    task_title: "Implement filters",
    task_description: "Filter tasks by status.",
    task_status: "pending",
    task_priority: "medium",
    task_due_date: "2026-08-16"
  },
  {
    task_title: "Deploy application",
    task_description: "Deploy the latest version.",
    task_status: "pending",
    task_priority: "high",
    task_due_date: "2026-08-17"
  }
];

export async function seedTasks(db: Database) {
  for (const task of tasks) {
    await insertTask(db, task);
  }

  console.log("20 tasks inserted successfully.");
}