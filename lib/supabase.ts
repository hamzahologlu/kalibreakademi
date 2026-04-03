/**
 * Supabase istemcisi ve veritabanı satır tipleri.
 * İstemci: createClient → tarayıcı (lib/supabase/client.ts)
 * Sunucu: createClient → lib/supabase/server.ts
 */

export { createClient } from "./supabase/client";
export type {
  CompanyRow,
  CourseAssignmentRow,
  CourseRow,
  ProfileRow,
  QuizResultRow,
  QuizRow,
  UserRole,
} from "./supabase/database.types";
