/** useActionState başlangıç değerleri — "use server" dosyalarından export edilemez. */

export type CompanyMutationState = {
  ok: boolean;
  error: string | null;
};

export type CourseMutationState = {
  ok: boolean;
  error: string | null;
};

export const initialCompanyMutationState: CompanyMutationState = {
  ok: false,
  error: null,
};

export const initialCourseMutationState: CourseMutationState = {
  ok: false,
  error: null,
};
