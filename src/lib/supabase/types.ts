/**
 * clippt v2 — Supabase database types.
 *
 * Hand-written to match the schema in supabase/migrations/20260429000000_initial_schema.sql.
 * Once Supabase CLI is running locally, these can be auto-generated via:
 *   npx supabase gen types typescript --local > src/lib/supabase/types.ts
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          handle: string;
          display_name: string;
          avatar_url: string | null;
          identity_line: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          handle: string;
          display_name: string;
          avatar_url?: string | null;
          identity_line?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          handle?: string;
          display_name?: string;
          avatar_url?: string | null;
          identity_line?: string | null;
          joined_at?: string;
        };
        Relationships: [];
      };
      urls: {
        Row: {
          id: string;
          short_id: string;
          url: string;
          title: string | null;
          description: string | null;
          og_image_url: string | null;
          skill_count: number | null;
          tag_suggestions: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          short_id: string;
          url: string;
          title?: string | null;
          description?: string | null;
          og_image_url?: string | null;
          skill_count?: number | null;
          tag_suggestions?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          short_id?: string;
          url?: string;
          title?: string | null;
          description?: string | null;
          og_image_url?: string | null;
          skill_count?: number | null;
          tag_suggestions?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saves: {
        Row: {
          id: string;
          user_id: string;
          url_id: string;
          notes: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url_id: string;
          notes?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url_id?: string;
          notes?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saves_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saves_url_id_fkey";
            columns: ["url_id"];
            isOneToOne: false;
            referencedRelation: "urls";
            referencedColumns: ["id"];
          },
        ];
      };
      user_follows: {
        Row: {
          id: string;
          follower_id: string;
          followed_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          followed_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          followed_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_follows_followed_id_fkey";
            columns: ["followed_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tag_follows: {
        Row: {
          id: string;
          user_id: string;
          tag: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tag: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tag?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tag_follows_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      set_current_user: {
        Args: { handle: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ─── Convenience types ─────────────────────────

export type User = Database["public"]["Tables"]["users"]["Row"];
export type Url = Database["public"]["Tables"]["urls"]["Row"];
export type Save = Database["public"]["Tables"]["saves"]["Row"];
export type UserFollow = Database["public"]["Tables"]["user_follows"]["Row"];
export type TagFollow = Database["public"]["Tables"]["tag_follows"]["Row"];

/** Save with joined user and url data — used in most UI contexts */
export type SaveWithDetails = Save & {
  user: User;
  url: Url;
};
