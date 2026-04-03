/**
 * Supabase public şeması — elle tutulan satır tipleri (codegen yoksa).
 * Şema: migration-course-assignments.sql / schema.sql ile uyumlu.
 */

export type UserRole = "ADMIN" | "UZMAN" | "WORKER";

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  company_id: string | null;
  /** İSG Uzmanlık numarası (genelde UZMAN) */
  isg_license_number: string | null;
};

export type CourseRow = {
  id: string;
  title: string;
  video_url: string | null;
  specialist_name: string | null;
  created_by: string | null;
};

export type CourseAssignmentRow = {
  id: string;
  course_id: string;
  company_id: string;
  assigned_at: string;
};

export type CompanyRow = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  /** Şirketi sisteme ekleyen uzman / admin */
  created_by: string | null;
};

export type QuizRow = {
  id: string;
  course_id: string;
  questions: unknown;
  passing_score: number;
};

export type QuizResultRow = {
  id: string;
  user_id: string;
  course_id: string;
  quiz_id: string | null;
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
  created_at: string;
};
