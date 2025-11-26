"use client";

import { useAllStores } from "@/store";

export default function DashboardPage() {
  const { user } = useAllStores();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Welcome 👋 {user?.name || "User"}
        </h1>
        <p className="mt-2 text-muted-foreground">Here's your overview.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Quick Stats</h3>
          <p className="text-sm text-muted-foreground">
            Your dashboard statistics will appear here.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Your recent activities will be displayed here.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Upcoming Tasks</h3>
          <p className="text-sm text-muted-foreground">
            Your upcoming tasks and deadlines will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
