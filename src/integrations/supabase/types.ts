export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_at: string | null;
          assigned_therapist: string | null;
          created_at: string;
          email: string | null;
          id: string;
          notes: string | null;
          patient_id: string | null;
          patient_name: string;
          phone: string | null;
          service: string | null;
          source: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          appointment_at?: string | null;
          assigned_therapist?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          notes?: string | null;
          patient_id?: string | null;
          patient_name: string;
          phone?: string | null;
          service?: string | null;
          source?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          appointment_at?: string | null;
          assigned_therapist?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          notes?: string | null;
          patient_id?: string | null;
          patient_name?: string;
          phone?: string | null;
          service?: string | null;
          source?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_posts: {
        Row: {
          author: string | null;
          author_id: string | null;
          category: string | null;
          content: string | null;
          created_at: string;
          excerpt: string | null;
          featured_image: string | null;
          id: string;
          meta_description: string | null;
          publish_at: string | null;
          seo_title: string | null;
          slug: string;
          status: string;
          tags: string[];
          title: string;
          updated_at: string;
          views: number;
        };
        Insert: {
          author?: string | null;
          author_id?: string | null;
          category?: string | null;
          content?: string | null;
          created_at?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          id?: string;
          meta_description?: string | null;
          publish_at?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: string;
          tags?: string[];
          title: string;
          updated_at?: string;
          views?: number;
        };
        Update: {
          author?: string | null;
          author_id?: string | null;
          category?: string | null;
          content?: string | null;
          created_at?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          id?: string;
          meta_description?: string | null;
          publish_at?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
          views?: number;
        };
        Relationships: [];
      };
      calculator_settings: {
        Row: {
          description: string | null;
          disclaimer: string | null;
          heading: string | null;
          key: string;
          updated_at: string;
        };
        Insert: {
          description?: string | null;
          disclaimer?: string | null;
          heading?: string | null;
          key: string;
          updated_at?: string;
        };
        Update: {
          description?: string | null;
          disclaimer?: string | null;
          heading?: string | null;
          key?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clinic_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      clinician_profiles: {
        Row: {
          approach: string[];
          bio: string | null;
          conditions_treated: string[];
          created_at: string;
          credentials: string;
          designation: string;
          display_order: number;
          expertise: string[];
          full_name: string;
          id: string;
          intro: string[];
          is_active: boolean;
          is_published: boolean;
          meta_description: string | null;
          meta_title: string | null;
          name: string;
          photo_path: string | null;
          photo_url: string | null;
          phone_display: string | null;
          professional_title: string;
          qualifications: string[];
          seo_bio: string | null;
          slug: string;
          specialties: string[];
          tags: string[];
          updated_at: string;
          whatsapp_number: string | null;
          service_mode: "clinic" | "online_only";
          city: string;
          experience: string[];
          training: string[];
          research: string[];
          years_experience: number | null;
        };
        Insert: {
          approach?: string[];
          bio?: string | null;
          conditions_treated?: string[];
          created_at?: string;
          credentials?: string;
          designation: string;
          display_order?: number;
          expertise?: string[];
          full_name: string;
          id?: string;
          intro?: string[];
          is_active?: boolean;
          is_published?: boolean;
          meta_description?: string | null;
          meta_title?: string | null;
          name: string;
          photo_path?: string | null;
          photo_url?: string | null;
          phone_display?: string | null;
          professional_title: string;
          qualifications?: string[];
          seo_bio?: string | null;
          slug: string;
          specialties?: string[];
          tags?: string[];
          updated_at?: string;
          whatsapp_number?: string | null;
          service_mode?: "clinic" | "online_only";
          city?: string;
          experience?: string[];
          training?: string[];
          research?: string[];
          years_experience?: number | null;
        };
        Update: {
          approach?: string[];
          bio?: string | null;
          conditions_treated?: string[];
          created_at?: string;
          credentials?: string;
          designation?: string;
          display_order?: number;
          expertise?: string[];
          full_name?: string;
          id?: string;
          intro?: string[];
          is_active?: boolean;
          is_published?: boolean;
          meta_description?: string | null;
          meta_title?: string | null;
          name?: string;
          photo_path?: string | null;
          photo_url?: string | null;
          phone_display?: string | null;
          professional_title?: string;
          qualifications?: string[];
          seo_bio?: string | null;
          slug?: string;
          specialties?: string[];
          tags?: string[];
          updated_at?: string;
          whatsapp_number?: string | null;
          service_mode?: "clinic" | "online_only";
          city?: string;
          experience?: string[];
          training?: string[];
          research?: string[];
          years_experience?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "clinician_profiles_photo_asset_fkey";
            columns: ["photo_path", "id"];
            isOneToOne: false;
            referencedRelation: "clinician_photo_assets";
            referencedColumns: ["path", "clinician_profile_id"];
          },
        ];
      };
      clinician_photo_assets: {
        Row: {
          clinician_profile_id: string;
          created_at: string;
          path: string;
        };
        Insert: {
          clinician_profile_id: string;
          created_at?: string;
          path: string;
        };
        Update: {
          clinician_profile_id?: string;
          created_at?: string;
          path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinician_photo_assets_clinician_profile_id_fkey";
            columns: ["clinician_profile_id"];
            isOneToOne: false;
            referencedRelation: "clinician_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_submissions: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          message: string;
          name: string;
          phone: string | null;
          status: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message: string;
          name: string;
          phone?: string | null;
          status?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string;
          name?: string;
          phone?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      fitness_content: {
        Row: {
          author_id: string;
          body: string | null;
          category: string | null;
          content_type: string;
          created_at: string;
          excerpt: string | null;
          extra: Json;
          featured_image: string | null;
          id: string;
          meta_description: string | null;
          seo_title: string | null;
          slug: string | null;
          sort_order: number;
          status: string;
          tags: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body?: string | null;
          category?: string | null;
          content_type?: string;
          created_at?: string;
          excerpt?: string | null;
          extra?: Json;
          featured_image?: string | null;
          id?: string;
          meta_description?: string | null;
          seo_title?: string | null;
          slug?: string | null;
          sort_order?: number;
          status?: string;
          tags?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string | null;
          category?: string | null;
          content_type?: string;
          created_at?: string;
          excerpt?: string | null;
          extra?: Json;
          featured_image?: string | null;
          id?: string;
          meta_description?: string | null;
          seo_title?: string | null;
          slug?: string | null;
          sort_order?: number;
          status?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      home_visit_requests: {
        Row: {
          address: string;
          admin_notes: string | null;
          assigned_therapist: string | null;
          created_at: string;
          full_name: string;
          id: string;
          maps_location: string | null;
          medical_condition: string | null;
          notes: string | null;
          patient_age: number | null;
          phone: string;
          preferred_date: string | null;
          preferred_time: string | null;
          report_url: string | null;
          scheduled_date: string | null;
          status: string;
        };
        Insert: {
          address: string;
          admin_notes?: string | null;
          assigned_therapist?: string | null;
          created_at?: string;
          full_name: string;
          id?: string;
          maps_location?: string | null;
          medical_condition?: string | null;
          notes?: string | null;
          patient_age?: number | null;
          phone: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          report_url?: string | null;
          scheduled_date?: string | null;
          status?: string;
        };
        Update: {
          address?: string;
          admin_notes?: string | null;
          assigned_therapist?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          maps_location?: string | null;
          medical_condition?: string | null;
          notes?: string | null;
          patient_age?: number | null;
          phone?: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          report_url?: string | null;
          scheduled_date?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      patient_visits: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          patient_id: string;
          status: string;
          therapist: string | null;
          visit_date: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          patient_id: string;
          status?: string;
          therapist?: string | null;
          visit_date?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          patient_id?: string;
          status?: string;
          therapist?: string | null;
          visit_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_visits_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          address: string | null;
          age: number | null;
          assigned_physiotherapist: string | null;
          created_at: string;
          diagnosis: string | null;
          email: string | null;
          follow_up_date: string | null;
          gender: string | null;
          id: string;
          medical_condition: string | null;
          name: string;
          notes: string | null;
          patient_code: string;
          phone: string | null;
          report_urls: string[];
          status: string;
          treatment_plan: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          age?: number | null;
          assigned_physiotherapist?: string | null;
          created_at?: string;
          diagnosis?: string | null;
          email?: string | null;
          follow_up_date?: string | null;
          gender?: string | null;
          id?: string;
          medical_condition?: string | null;
          name: string;
          notes?: string | null;
          patient_code?: string;
          phone?: string | null;
          report_urls?: string[];
          status?: string;
          treatment_plan?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          age?: number | null;
          assigned_physiotherapist?: string | null;
          created_at?: string;
          diagnosis?: string | null;
          email?: string | null;
          follow_up_date?: string | null;
          gender?: string | null;
          id?: string;
          medical_condition?: string | null;
          name?: string;
          notes?: string | null;
          patient_code?: string;
          phone?: string | null;
          report_urls?: string[];
          status?: string;
          treatment_plan?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          availability: string | null;
          bio: string | null;
          certifications: string | null;
          clinical_interests: string[];
          created_at: string;
          display_order: number;
          faqs: Json;
          full_name: string;
          gallery: Json;
          is_published: boolean;
          phone: string | null;
          photo_url: string | null;
          professional_title: string;
          public_email: string | null;
          qualifications: string | null;
          slug: string | null;
          specialties: string[];
          updated_at: string;
          user_id: string;
          years_experience: number | null;
        };
        Insert: {
          availability?: string | null;
          bio?: string | null;
          certifications?: string | null;
          clinical_interests?: string[];
          created_at?: string;
          display_order?: number;
          faqs?: Json;
          full_name?: string;
          gallery?: Json;
          is_published?: boolean;
          phone?: string | null;
          photo_url?: string | null;
          professional_title?: string;
          public_email?: string | null;
          qualifications?: string | null;
          slug?: string | null;
          specialties?: string[];
          updated_at?: string;
          user_id: string;
          years_experience?: number | null;
        };
        Update: {
          availability?: string | null;
          bio?: string | null;
          certifications?: string | null;
          clinical_interests?: string[];
          created_at?: string;
          display_order?: number;
          faqs?: Json;
          full_name?: string;
          gallery?: Json;
          is_published?: boolean;
          phone?: string | null;
          photo_url?: string | null;
          professional_title?: string;
          public_email?: string | null;
          qualifications?: string | null;
          slug?: string | null;
          specialties?: string[];
          updated_at?: string;
          user_id?: string;
          years_experience?: number | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      bootstrap_admin: { Args: never; Returns: undefined };
      can_edit_content: { Args: { _user_id: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role:
        | "admin"
        | "staff"
        | "super_admin"
        | "clinical_physiotherapist"
        | "dietitian"
        | "fitness_professional"
        | "content_editor";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "staff",
        "super_admin",
        "clinical_physiotherapist",
        "dietitian",
        "fitness_professional",
        "content_editor",
      ],
    },
  },
} as const;
