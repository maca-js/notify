import type { Database } from "@/shared/api/supabase.types";
import { Bell } from "lucide-react";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

type Props = {
  notifications: Notification[];
};

export function NotificationLog({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <Bell className="h-8 w-8 opacity-30" />
        <p className="text-sm">No notifications sent yet.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {notifications.map((n) => (
        <li key={n.id} className="py-3 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">{n.asset_name}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(n.sent_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {n.message.replace(/<[^>]+>/g, "")}
          </p>
        </li>
      ))}
    </ul>
  );
}
