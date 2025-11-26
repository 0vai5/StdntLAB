/**
 * Recent activity entry
 */
export interface RecentActivity {
  id: string;
  type: "todo_created" | "todo_completed" | "todo_updated" | "todo_deleted";
  message: string;
  todo_id: number;
  todo_title: string;
  created_at: string;
}

