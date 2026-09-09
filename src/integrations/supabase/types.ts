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
      extension_rate_limits: {
        Row: {
          fingerprint: string
          request_count: number
          updated_at: string
          window_started_at: string
        }
        Insert: {
          fingerprint: string
          request_count?: number
          updated_at?: string
          window_started_at?: string
        }
        Update: {
          fingerprint?: string
          request_count?: number
          updated_at?: string
          window_started_at?: string
        }
        Relationships: []
      }
      license_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json
          id: number
          license_id: number | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json
          id?: number
          license_id?: number | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json
          id?: number
          license_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "license_audit_logs_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      license_devices: {
        Row: {
          device_id: string
          first_seen: string
          id: string
          label: string | null
          last_seen: string
          license_id: number
          trial_license_id: number | null
          wa_number: string | null
        }
        Insert: {
          device_id: string
          first_seen?: string
          id?: string
          label?: string | null
          last_seen?: string
          license_id: number
          trial_license_id?: number | null
          wa_number?: string | null
        }
        Update: {
          device_id?: string
          first_seen?: string
          id?: string
          label?: string | null
          last_seen?: string
          license_id?: number
          trial_license_id?: number | null
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
          {
            foreignKeyName: "license_devices_trial_license_id_fkey"
            columns: ["trial_license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          activated_at: string | null
          admin_note: string | null
          app_user_id: string | null
          business_name: string | null
          created_at: string
          current_devices: number
          customer_phone: string | null
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
          admin_note?: string | null
          app_user_id?: string | null
          business_name?: string | null
          created_at?: string
          current_devices?: number
          customer_phone?: string | null
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
          admin_note?: string | null
          app_user_id?: string | null
          business_name?: string | null
          created_at?: string
          current_devices?: number
          customer_phone?: string | null
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
      claim_license_device: {
        Args: {
          _device_id: string
          _label: string
          _license_id: number
          _max_devices: number
          _wa_number: string
        }
        Returns: {
          created: boolean
          device_count: number
          device_row_id: string
        }[]
      }
      consume_extension_rate_limit: {
        Args: {
          _fingerprint: string
          _limit?: number
          _window_seconds?: number
        }
        Returns: boolean
      }
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
