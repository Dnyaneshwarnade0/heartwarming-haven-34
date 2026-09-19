export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_state: {
        Row: {
          data: Json
          org_id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          org_id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_state_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_actions: {
        Row: {
          applied: boolean
          chat_id: number | null
          created_at: string
          id: string
          kind: string
          org_id: string
          payload: Json
        }
        Insert: {
          applied?: boolean
          chat_id?: number | null
          created_at?: string
          id?: string
          kind: string
          org_id: string
          payload?: Json
        }
        Update: {
          applied?: boolean
          chat_id?: number | null
          created_at?: string
          id?: string
          kind?: string
          org_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "bot_actions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_attendance: {
        Row: {
          absent_rolls: number[]
          applied: boolean
          chat_id: number | null
          created_at: string
          date: string
          id: string
          org_id: string
          session: string
        }
        Insert: {
          absent_rolls?: number[]
          applied?: boolean
          chat_id?: number | null
          created_at?: string
          date: string
          id?: string
          org_id: string
          session: string
        }
        Update: {
          absent_rolls?: number[]
          applied?: boolean
          chat_id?: number | null
          created_at?: string
          date?: string
          id?: string
          org_id?: string
          session?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_attendance_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_sessions: {
        Row: {
          chat_id: number
          state: Json
          updated_at: string
        }
        Insert: {
          chat_id: number
          state?: Json
          updated_at?: string
        }
        Update: {
          chat_id?: number
          state?: Json
          updated_at?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_snapshots: {
        Row: {
          data: Json
          org_id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          org_id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_snapshots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          city: string | null
          created_at: string
          id: string
          link_code: string | null
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          link_code?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          link_code?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      parent_links: {
        Row: {
          chat_id: number
          created_at: string
          id: string
          org_id: string
          parent_code: string
          student_id: string
          student_name: string | null
          username: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          id?: string
          org_id: string
          parent_code: string
          student_id: string
          student_name?: string | null
          username?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          id?: string
          org_id?: string
          parent_code?: string
          student_id?: string
          student_name?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          org_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          student_count: number
          submitted_by: string
          utr: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          org_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_count: number
          submitted_by: string
          utr?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          org_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_count?: number
          submitted_by?: string
          utr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sent_notifications: {
        Row: {
          chat_id: number
          created_at: string
          dedupe_key: string
          id: string
          org_id: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          dedupe_key: string
          id?: string
          org_id: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          dedupe_key?: string
          id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          org_id: string
          status: Database["public"]["Enums"]["sub_status"]
          student_count: number
          trial_ends_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          org_id: string
          status?: Database["public"]["Enums"]["sub_status"]
          student_count?: number
          trial_ends_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          org_id?: string
          status?: Database["public"]["Enums"]["sub_status"]
          student_count?: number
          trial_ends_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_failed_updates: {
        Row: {
          chat_id: number | null
          created_at: string
          error_reason: string | null
          id: string
          stage: string
          update_id: number | null
          update_type: string | null
        }
        Insert: {
          chat_id?: number | null
          created_at?: string
          error_reason?: string | null
          id?: string
          stage: string
          update_id?: number | null
          update_type?: string | null
        }
        Update: {
          chat_id?: number | null
          created_at?: string
          error_reason?: string | null
          id?: string
          stage?: string
          update_id?: number | null
          update_type?: string | null
        }
        Relationships: []
      }
      telegram_invites: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: number | null
          label: string | null
          org_id: string
          permissions: Json | null
          role: string
          used_at: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by?: number | null
          label?: string | null
          org_id: string
          permissions?: Json | null
          role: string
          used_at?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: number | null
          label?: string | null
          org_id?: string
          permissions?: Json | null
          role?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_links: {
        Row: {
          chat_id: number
          created_at: string
          id: string
          org_id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["org_role"]
          username: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          id?: string
          org_id: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["org_role"]
          username?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          id?: string
          org_id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["org_role"]
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_updates: {
        Row: {
          created_at: string
          update_id: number
        }
        Insert: {
          created_at?: string
          update_id: number
        }
        Update: {
          created_at?: string
          update_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_org_id: { Args: { _user_id: string }; Returns: string }
      gen_link_code: { Args: never; Returns: string }
      has_org_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["org_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      price_for_students: { Args: { _count: number }; Returns: number }
    }
    Enums: {
      org_role: "owner" | "admin" | "staff"
      payment_status: "pending" | "approved" | "rejected"
      sub_status: "trialing" | "active" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      org_role: ["owner", "admin", "staff"],
      payment_status: ["pending", "approved", "rejected"],
      sub_status: ["trialing", "active", "expired"],
    },
  },
} as const
