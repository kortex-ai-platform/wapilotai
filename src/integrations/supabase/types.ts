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
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          meta: Json | null
          wa_number: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: never
          meta?: Json | null
          wa_number?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: never
          meta?: Json | null
          wa_number?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          value: string | null
        }
        Insert: {
          key: string
          value?: string | null
        }
        Update: {
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_active_at: string | null
          name: string | null
          notes: string | null
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          last_active_at?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_active_at?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      license_devices: {
        Row: {
          device_id: string
          first_seen: string
          id: string
          label: string | null
          last_seen: string
          license_id: number
          wa_number: string | null
        }
        Insert: {
          device_id: string
          first_seen?: string
          id?: string
          label?: string | null
          last_seen?: string
          license_id: number
          wa_number?: string | null
        }
        Update: {
          device_id?: string
          first_seen?: string
          id?: string
          label?: string | null
          last_seen?: string
          license_id?: number
          wa_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_devices_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          activated_at: string | null
          app_user_id: string | null
          business_name: string | null
          created_at: string
          current_devices: number
          duration_days: number | null
          expires_at: string | null
          id: number
          key_hash: string | null
          key_prefix: string | null
          last_validation: string | null
          license_key: string | null
          max_devices: number
          plan: string
          revoked_at: string | null
          status: string
          trial_days: number
          trial_start: string | null
          user_name: string | null
          wa_number: string | null
        }
        Insert: {
          activated_at?: string | null
          app_user_id?: string | null
          business_name?: string | null
          created_at?: string
          current_devices?: number
          duration_days?: number | null
          expires_at?: string | null
          id?: never
          key_hash?: string | null
          key_prefix?: string | null
          last_validation?: string | null
          license_key?: string | null
          max_devices?: number
          plan?: string
          revoked_at?: string | null
          status?: string
          trial_days?: number
          trial_start?: string | null
          user_name?: string | null
          wa_number?: string | null
        }
        Update: {
          activated_at?: string | null
          app_user_id?: string | null
          business_name?: string | null
          created_at?: string
          current_devices?: number
          duration_days?: number | null
          expires_at?: string | null
          id?: never
          key_hash?: string | null
          key_prefix?: string | null
          last_validation?: string | null
          license_key?: string | null
          max_devices?: number
          plan?: string
          revoked_at?: string | null
          status?: string
          trial_days?: number
          trial_start?: string | null
          user_name?: string | null
          wa_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: string | null
          business_name: string | null
          created_at: string
          customer_name: string | null
          id: number
          plan: string | null
          sender_info: string | null
          status: string
          trx_id: string | null
          wa_number: string
        }
        Insert: {
          amount?: string | null
          business_name?: string | null
          created_at?: string
          customer_name?: string | null
          id?: never
          plan?: string | null
          sender_info?: string | null
          status?: string
          trx_id?: string | null
          wa_number: string
        }
        Update: {
          amount?: string | null
          business_name?: string | null
          created_at?: string
          customer_name?: string | null
          id?: never
          plan?: string | null
          sender_info?: string | null
          status?: string
          trx_id?: string | null
          wa_number?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
