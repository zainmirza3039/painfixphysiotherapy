// Central role model for the PainFix admin / professional portal.
// Roles are stored in public.user_roles (never on profiles) and checked
// server-side via SECURITY DEFINER functions (has_role / is_admin /
// can_edit_content). This file only provides labels + groupings for the UI.

export const APP_ROLES = [
  "super_admin",
  "admin",
  "clinical_physiotherapist",
  "dietitian",
  "fitness_professional",
  "content_editor",
  "staff",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  clinical_physiotherapist: "Clinical Physiotherapist",
  dietitian: "Dietitian",
  fitness_professional: "Fitness Professional",
  content_editor: "Content Editor",
  staff: "Staff",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  super_admin: "Full control of the entire system, including team & roles.",
  admin: "Full access to patients, appointments, content and settings.",
  clinical_physiotherapist: "Manages their own profile and clinical articles.",
  dietitian: "Manages their own profile and nutrition articles.",
  fitness_professional: "Manages their own profile and fitness articles.",
  content_editor: "Creates and manages their own blog articles.",
  staff: "Manages patients, appointments and home visits.",
};

// Roles with top-level administrative privileges.
export const ADMIN_ROLES: AppRole[] = ["super_admin", "admin"];

// Clinical / wellness professionals who get a self-management portal.
export const PROFESSIONAL_ROLES: AppRole[] = [
  "clinical_physiotherapist",
  "dietitian",
  "fitness_professional",
];

// Roles allowed to author & manage their own blog content.
export const CONTENT_ROLES: AppRole[] = [
  ...ADMIN_ROLES,
  ...PROFESSIONAL_ROLES,
  "content_editor",
];

// Any role that should be able to sign into the admin/portal area at all.
export const PANEL_ROLES: AppRole[] = [
  ...ADMIN_ROLES,
  ...PROFESSIONAL_ROLES,
  "content_editor",
  "staff",
];

export function roleLabel(role: string): string {
  return ROLE_LABELS[role as AppRole] ?? role;
}
