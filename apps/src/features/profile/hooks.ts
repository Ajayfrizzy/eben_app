import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth";
import { requireBackend } from "../../services/supabase";
import { createProfileRepository, type ProfileInput } from "./repository";
export const profileKey = (id: string | undefined) => ["student-profile", id] as const;
export function useStudentProfile() {
  const { session, demo } = useAuth();
  return useQuery({
    queryKey: profileKey(session?.user.id),
    queryFn: () => createProfileRepository(requireBackend()).read(session!.user.id),
    enabled: !demo && Boolean(session?.user.email_confirmed_at),
    retry: 1,
  });
}
export function useProfileReferences() {
  const { demo } = useAuth();
  return useQuery({
    queryKey: ["profile-references"],
    queryFn: () => createProfileRepository(requireBackend()).references(),
    enabled: !demo,
    staleTime: 300000,
    retry: 1,
  });
}
export function useSaveProfile() {
  const { session } = useAuth();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ input, complete }: { input: ProfileInput; complete: boolean }) =>
      createProfileRepository(requireBackend()).save(input, complete),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: profileKey(session?.user.id) });
    },
  });
}
