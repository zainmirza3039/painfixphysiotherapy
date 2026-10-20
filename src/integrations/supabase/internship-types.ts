import type { Database, Json } from "./types";
import type {
  Application,
  Certificate,
  CertificateEvent,
  ExperienceRecord,
  Participant,
  Program,
} from "@/lib/internships.contract";

type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };
export type InternshipAuditEvent = {
  id: string;
  operation: string;
  entity_id: string;
  actor_id: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};
export type InternshipDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Tables" | "Functions"> & {
    Tables: {
      internship_programs: Table<Program>;
      internship_applications: Table<Application>;
      internship_participants: Table<Participant>;
      professional_experience_records: Table<ExperienceRecord>;
      certificates: Table<Certificate>;
      certificate_events: Table<CertificateEvent>;
      internship_audit_events: Table<InternshipAuditEvent>;
      internship_public_rate_limits: Table<{
        key_hash: string;
        window_started_at: string;
        request_count: number;
      }>;
    };
    Functions: Database["public"]["Functions"] & {
      is_admin: { Args: { _user_id: string }; Returns: boolean };
      internship_check_public_rate_limit: {
        Args: { p_kind: "submit" | "verify"; p_rate_key: string; p_secondary: string };
        Returns: boolean;
      };
      submit_internship_application: {
        Args: { p_payload: Json; p_rate_key?: string };
        Returns: Json;
      };
      verify_internship_certificate: {
        Args: { p_reference: string; p_rate_key?: string };
        Returns: Array<{ status: string; certificate: Json | null }>;
      };
      admin_save_internship_program: { Args: { _actor_id: string; p: Json }; Returns: Json };
      admin_review_internship_application: {
        Args: { _actor_id: string; p_id: string; p_status: string; p_notes?: string | null };
        Returns: Json;
      };
      admin_save_internship_participant: { Args: { _actor_id: string; p: Json }; Returns: Json };
      admin_save_experience_record: { Args: { _actor_id: string; p: Json }; Returns: Json };
      admin_issue_internship_certificate: {
        Args: {
          _actor_id: string;
          p_type: string;
          p_source_id: string;
          p_signatory_name: string;
          p_signatory_designation: string;
          p_replacement_for?: string | null;
          p_replacement_reason?: string | null;
        };
        Returns: Json;
      };
      admin_revoke_internship_certificate: {
        Args: { _actor_id: string; p_id: string; p_reason: string };
        Returns: Json;
      };
      admin_anonymize_internship_application: {
        Args: { _actor_id: string; p_id: string; p_reason: string };
        Returns: Json;
      };
    };
  };
};
