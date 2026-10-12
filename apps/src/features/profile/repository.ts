import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { profileSchema } from "@eben/validation";
export const profileInputSchema = profileSchema.extend({
  institution: z.string().uuid("Choose an institution"),
  interests: z.array(z.string().uuid()).min(1, "Choose at least one interest"),
  visibility: z.enum(["private", "students"]).default("private"),
});
export type ProfileInput = z.infer<typeof profileInputSchema>;
export type StudentProfile = {
  id: string;
  full_name: string;
  country: string | null;
  city: string | null;
  institution_id: string | null;
  programme: string | null;
  study_level: string | null;
  biography: string | null;
  visibility: { directory?: "private" | "students" };
  onboarding_complete: boolean;
  user_interests: { interest_id: string }[];
};
export type Reference = { id: string; name: string; country?: string };
export function createProfileRepository(client: SupabaseClient) {
  return {
    async read(userId: string): Promise<StudentProfile | null> {
      const { data, error } = await client
        .from("profiles")
        .select(
          "id,full_name,country,city,institution_id,programme,study_level,biography,visibility,onboarding_complete,user_interests(interest_id)",
        )
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as StudentProfile | null;
    },
    async references() {
      const [institutions, interests] = await Promise.all([
        client.from("institutions").select("id,name,country").order("name"),
        client.from("interests").select("id,name").order("name"),
      ]);
      if (institutions.error) throw institutions.error;
      if (interests.error) throw interests.error;
      return {
        institutions: institutions.data as Reference[],
        interests: interests.data as Reference[],
      };
    },
    async save(input: ProfileInput, complete: boolean) {
      const parsed = complete ? profileInputSchema.parse(input) : input;
      const { error } = await client.rpc("save_student_profile", {
        p_full_name: parsed.fullName.trim(),
        p_country: parsed.country.trim(),
        p_city: parsed.city.trim(),
        p_institution_id: parsed.institution || null,
        p_programme: parsed.programme.trim(),
        p_study_level: parsed.studyLevel.trim(),
        p_biography: parsed.biography ?? "",
        p_interest_ids: [...new Set(parsed.interests)],
        p_directory: parsed.visibility,
        p_complete: complete,
      });
      if (error) throw error;
    },
    async requestDeletion() {
      const { error } = await client.rpc("request_student_deletion");
      if (error) throw error;
    },
  };
}
