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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          is_current: boolean | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ambitions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          academic_year_id: string
          attendance_date: string
          cluster_id: string
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          marked_at: string | null
          marked_by_teacher_id: string | null
          marked_by_user_id: string | null
          program_id: string
          status_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          attendance_date: string
          cluster_id: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          marked_at?: string | null
          marked_by_teacher_id?: string | null
          marked_by_user_id?: string | null
          program_id: string
          status_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          attendance_date?: string
          cluster_id?: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          marked_at?: string | null
          marked_by_teacher_id?: string | null
          marked_by_user_id?: string | null
          program_id?: string
          status_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_marked_by_teacher_id_fkey"
            columns: ["marked_by_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "attendance_status_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_status_types: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      caste_categories: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          state: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          state: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          state?: string
        }
        Relationships: []
      }
      clusters: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          geo_radius_meters: number | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          geo_radius_meters?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          geo_radius_meters?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          donation_date: string
          donor_id: string
          id: string
          payment_mode_id: string | null
          reference_number: string | null
          remarks: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          donation_date?: string
          donor_id: string
          id?: string
          payment_mode_id?: string | null
          reference_number?: string | null
          remarks?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          donation_date?: string
          donor_id?: string
          id?: string
          payment_mode_id?: string | null
          reference_number?: string | null
          remarks?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_payment_mode_id_fkey"
            columns: ["payment_mode_id"]
            isOneToOne: false
            referencedRelation: "payment_modes"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          created_at: string | null
          date_of_birth: string | null
          donor_code: string | null
          donor_type: string | null
          email: string | null
          id: string
          id_number: string | null
          id_proof_type_id: string | null
          is_active: boolean | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          donor_code?: string | null
          donor_type?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          id_proof_type_id?: string | null
          is_active?: boolean | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          donor_code?: string | null
          donor_type?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          id_proof_type_id?: string | null
          is_active?: boolean | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donors_id_proof_type_id_fkey"
            columns: ["id_proof_type_id"]
            isOneToOne: false
            referencedRelation: "id_proof_types"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          address: string | null
          annual_income: number | null
          bank_account_number: string | null
          bank_name: string | null
          city: string | null
          created_at: string | null
          currency: string | null
          date_of_birth: string | null
          gender: string | null
          id: string
          id_number: string | null
          id_proof_type_id: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          occupation: string | null
          phone: string | null
          photo_url: string | null
          relationship: string
          state: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          annual_income?: number | null
          bank_account_number?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          id_number?: string | null
          id_proof_type_id?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_url?: string | null
          relationship: string
          state?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          annual_income?: number | null
          bank_account_number?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          id_number?: string | null
          id_proof_type_id?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_url?: string | null
          relationship?: string
          state?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_id_proof_type_id_fkey"
            columns: ["id_proof_type_id"]
            isOneToOne: false
            referencedRelation: "id_proof_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      hobbies: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      id_proof_types: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      payment_modes: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_academic_records: {
        Row: {
          academic_year_id: string
          attendance_percentage: number | null
          class_grade: string | null
          cluster_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          program_id: string
          remarks: string | null
          result_percentage: number | null
          school_name: string | null
          student_id: string
          updated_at: string | null
          yearly_fees: number | null
        }
        Insert: {
          academic_year_id: string
          attendance_percentage?: number | null
          class_grade?: string | null
          cluster_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          program_id: string
          remarks?: string | null
          result_percentage?: number | null
          school_name?: string | null
          student_id: string
          updated_at?: string | null
          yearly_fees?: number | null
        }
        Update: {
          academic_year_id?: string
          attendance_percentage?: number | null
          class_grade?: string | null
          cluster_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          program_id?: string
          remarks?: string | null
          result_percentage?: number | null
          school_name?: string | null
          student_id?: string
          updated_at?: string | null
          yearly_fees?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_academic_records_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_academic_records_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_academic_records_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_academic_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_active: boolean | null
          name: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          name: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          name?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          ambition: string | null
          caste_id: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          enrolled_at: string | null
          gender: string | null
          hobbies: string[] | null
          id: string
          id_number: string | null
          id_proof_type_id: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          state: string | null
          student_code: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          ambition?: string | null
          caste_id?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          enrolled_at?: string | null
          gender?: string | null
          hobbies?: string[] | null
          id?: string
          id_number?: string | null
          id_proof_type_id?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          state?: string | null
          student_code?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          ambition?: string | null
          caste_id?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          enrolled_at?: string | null
          gender?: string | null
          hobbies?: string[] | null
          id?: string
          id_number?: string | null
          id_proof_type_id?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          state?: string | null
          student_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_caste_id_fkey"
            columns: ["caste_id"]
            isOneToOne: false
            referencedRelation: "caste_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_id_proof_type_id_fkey"
            columns: ["id_proof_type_id"]
            isOneToOne: false
            referencedRelation: "id_proof_types"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          academic_year_id: string
          cluster_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          program_id: string
          role: Database["public"]["Enums"]["teacher_role"]
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          cluster_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          program_id: string
          role?: Database["public"]["Enums"]["teacher_role"]
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          cluster_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          program_id?: string
          role?: Database["public"]["Enums"]["teacher_role"]
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          gender: string | null
          id: string
          id_number: string | null
          id_proof_type_id: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          state: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          id_number?: string | null
          id_proof_type_id?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          id_number?: string | null
          id_proof_type_id?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_id_proof_type_id_fkey"
            columns: ["id_proof_type_id"]
            isOneToOne: false
            referencedRelation: "id_proof_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "management" | "teacher"
      teacher_role: "main" | "backup"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "management", "teacher"],
      teacher_role: ["main", "backup"],
    },
  },
} as const
