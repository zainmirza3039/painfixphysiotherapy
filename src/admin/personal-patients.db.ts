import { supabase } from "@/integrations/supabase/client";

export interface PersonalPatientQueryResult<T = unknown> {
  data: T;
  error: { message: string; code?: string } | null;
}

export interface PersonalPatientQueryBuilder extends PromiseLike<
  PersonalPatientQueryResult<unknown>
> {
  select(
    columns: string,
    options?: { count?: "exact" | "planned" | "estimated"; head?: boolean },
  ): PersonalPatientQueryBuilder;
  eq(column: string, value: string | number): PersonalPatientQueryBuilder;
  neq(column: string, value: string | number): PersonalPatientQueryBuilder;
  order(
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ): PersonalPatientQueryBuilder;
  limit(count: number): PersonalPatientQueryBuilder;
  single(): Promise<PersonalPatientQueryResult<unknown>>;
  insert(values: Record<string, unknown> | Record<string, unknown>[]): PersonalPatientQueryBuilder;
  update(values: Record<string, unknown>): PersonalPatientQueryBuilder;
}

export interface PersonalPatientDatabaseClient {
  from(table: string): PersonalPatientQueryBuilder;
}

/**
 * Temporary typed boundary for the isolated personal-patient tables.
 * The canonical generated Supabase Database type is intentionally not modified
 * until the migration is applied to a controlled development database.
 */
export const personalPatientDb = supabase as unknown as PersonalPatientDatabaseClient;
