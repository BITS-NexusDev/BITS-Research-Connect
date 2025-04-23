export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          btech_branch: string | null
          cgpa: number
          created_at: string
          dual_degree: string | null
          email: string
          full_name: string
          id: string
          id_number: string
          minor_degree: string | null
          pitch: string
          position_id: string
          status: string
          student_id: string
          whatsapp_number: string
        }
        Insert: {
          btech_branch?: string | null
          cgpa: number
          created_at?: string
          dual_degree?: string | null
          email: string
          full_name: string
          id?: string
          id_number: string
          minor_degree?: string | null
          pitch: string
          position_id: string
          status: string
          student_id: string
          whatsapp_number: string
        }
        Update: {
          btech_branch?: string | null
          cgpa?: number
          created_at?: string
          dual_degree?: string | null
          email?: string
          full_name?: string
          id?: string
          id_number?: string
          minor_degree?: string | null
          pitch?: string
          position_id?: string
          status?: string
          student_id?: string
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "research_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          btech_branch: string | null
          cgpa: number | null
          chamber_number: string | null
          created_at: string
          department: string | null
          designation:
            | Database["public"]["Enums"]["professor_designation"]
            | null
          dual_degree: string | null
          email: string
          full_name: string
          id: string
          id_number: string
          minor_degree: string | null
          research_interests: string | null
          role: string
          whatsapp_number: string | null
        }
        Insert: {
          btech_branch?: string | null
          cgpa?: number | null
          chamber_number?: string | null
          created_at?: string
          department?: string | null
          designation?:
            | Database["public"]["Enums"]["professor_designation"]
            | null
          dual_degree?: string | null
          email: string
          full_name: string
          id: string
          id_number: string
          minor_degree?: string | null
          research_interests?: string | null
          role: string
          whatsapp_number?: string | null
        }
        Update: {
          btech_branch?: string | null
          cgpa?: number | null
          chamber_number?: string | null
          created_at?: string
          department?: string | null
          designation?:
            | Database["public"]["Enums"]["professor_designation"]
            | null
          dual_degree?: string | null
          email?: string
          full_name?: string
          id?: string
          id_number?: string
          minor_degree?: string | null
          research_interests?: string | null
          role?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      research_positions: {
        Row: {
          course_code: string
          created_at: string
          credits: number
          department: string
          eligible_branches: string[]
          id: string
          last_date_to_apply: string
          minimum_cgpa: number
          number_of_openings: number
          prerequisites: string | null
          professor_id: string
          professor_name: string
          research_area: string
          semester: string
          specific_requirements: string | null
          status: string
          summary: string
        }
        Insert: {
          course_code: string
          created_at?: string
          credits: number
          department: string
          eligible_branches?: string[]
          id?: string
          last_date_to_apply: string
          minimum_cgpa: number
          number_of_openings?: number
          prerequisites?: string | null
          professor_id: string
          professor_name: string
          research_area: string
          semester: string
          specific_requirements?: string | null
          status: string
          summary: string
        }
        Update: {
          course_code?: string
          created_at?: string
          credits?: number
          department?: string
          eligible_branches?: string[]
          id?: string
          last_date_to_apply?: string
          minimum_cgpa?: number
          number_of_openings?: number
          prerequisites?: string | null
          professor_id?: string
          professor_name?: string
          research_area?: string
          semester?: string
          specific_requirements?: string | null
          status?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_positions_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      professor_designation:
        | "Professor"
        | "Senior Professor"
        | "Associate Professor"
        | "Assistant Professor"
        | "Junior Professor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      professor_designation: [
        "Professor",
        "Senior Professor",
        "Associate Professor",
        "Assistant Professor",
        "Junior Professor",
      ],
    },
  },
} as const
