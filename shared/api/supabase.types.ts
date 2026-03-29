// Row types (what you get from SELECT)
type UserRow = {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  photo_url: string | null;
  created_at: string;
};

type AssetRow = {
  id: string;
  coingecko_id: string;
  symbol: string;
  name: string;
  created_at: string;
};

type WatchlistRow = {
  id: string;
  user_id: string;
  asset_id: string;
  created_at: string;
};

type AlertRow = {
  id: string;
  user_id: string;
  asset_id: string;
  type: "percent_change" | "threshold";
  condition: "above" | "below";
  value: number;
  timeframe: "24h";
  is_active: boolean;
  cooldown_minutes: number;
  last_triggered_at: string | null;
  created_at: string;
};

type NotificationRow = {
  id: string;
  user_id: string;
  alert_id: string | null;
  asset_name: string;
  message: string;
  sent_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, "id" | "created_at">;
        Update: Partial<Omit<UserRow, "id" | "created_at">>;
        Relationships: [];
      };
      assets: {
        Row: AssetRow;
        Insert: Omit<AssetRow, "id" | "created_at">;
        Update: Partial<Omit<AssetRow, "id" | "created_at">>;
        Relationships: [];
      };
      watchlist: {
        Row: WatchlistRow;
        Insert: Omit<WatchlistRow, "id" | "created_at">;
        Update: Partial<Omit<WatchlistRow, "id" | "created_at">>;
        Relationships: [
          { foreignKeyName: "watchlist_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "watchlist_asset_id_fkey"; columns: ["asset_id"]; referencedRelation: "assets"; referencedColumns: ["id"] }
        ];
      };
      alerts: {
        Row: AlertRow;
        Insert: Omit<AlertRow, "id" | "created_at">;
        Update: Partial<Omit<AlertRow, "id" | "created_at">>;
        Relationships: [
          { foreignKeyName: "alerts_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "alerts_asset_id_fkey"; columns: ["asset_id"]; referencedRelation: "assets"; referencedColumns: ["id"] }
        ];
      };
      notifications: {
        Row: NotificationRow;
        Insert: Omit<NotificationRow, "id" | "sent_at">;
        Update: Partial<Omit<NotificationRow, "id" | "sent_at">>;
        Relationships: [
          { foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "notifications_alert_id_fkey"; columns: ["alert_id"]; referencedRelation: "alerts"; referencedColumns: ["id"] }
        ];
      };
    };
    Views: { [_ in never]?: never };
    Functions: { [_ in never]?: never };
    Enums: { [_ in never]?: never };
    CompositeTypes: { [_ in never]?: never };
  };
};
