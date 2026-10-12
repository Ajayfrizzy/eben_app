import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createProfileRepository, type ProfileInput } from "./repository";
const id = "11111111-1111-4111-8111-111111111111";
const input: ProfileInput = {
  fullName: "Student A",
  country: "Nigeria",
  city: "Lagos",
  institution: id,
  programme: "Science",
  studyLevel: "100",
  biography: "Hello",
  interests: [id, id],
  skills: [],
  visibility: "private",
};
describe("profile persistence", () => {
  it("uses one atomic RPC with normalized ids and deduplicated interests", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const repo = createProfileRepository({ rpc } as unknown as SupabaseClient);
    await repo.save(input, true);
    await repo.save(input, true);
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc.mock.calls[0]).toEqual([
      "save_student_profile",
      {
        p_full_name: "Student A",
        p_country: "Nigeria",
        p_city: "Lagos",
        p_institution_id: id,
        p_programme: "Science",
        p_study_level: "100",
        p_biography: "Hello",
        p_interest_ids: [id],
        p_directory: "private",
        p_complete: true,
      },
    ]);
    expect(rpc.mock.calls[1]).toEqual(rpc.mock.calls[0]);
    expect(rpc.mock.calls[0]![1]).not.toHaveProperty("user_id");
  });
  it("rejects invalid completion before sending anything", async () => {
    const rpc = vi.fn();
    const repo = createProfileRepository({ rpc } as unknown as SupabaseClient);
    await expect(
      repo.save({ ...input, institution: "invented", interests: [] }, true),
    ).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("saves incomplete drafts without granting completion and propagates failures", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const repo = createProfileRepository({ rpc } as unknown as SupabaseClient);
    await repo.save({ ...input, institution: "", interests: [] }, false);
    expect(rpc.mock.calls[0]![1]).toMatchObject({
      p_complete: false,
      p_institution_id: null,
      p_interest_ids: [],
    });
    rpc.mockResolvedValue({ error: new Error("transaction failed") });
    await expect(repo.save(input, true)).rejects.toThrow("transaction failed");
  });
  it("loads only the requested owner's profile and treats missing rows as null", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const repo = createProfileRepository({
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as SupabaseClient);
    expect(await repo.read(id)).toBeNull();
    expect(eq).toHaveBeenCalledWith("id", id);
    maybeSingle.mockResolvedValue({ data: null, error: new Error("Offline") });
    await expect(repo.read(id)).rejects.toThrow("Offline");
  });
});
