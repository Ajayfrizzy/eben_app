import { supabase } from "../../services/supabase";
import { createIdentityService } from "./service";
export const identity = supabase ? createIdentityService(supabase) : null;
export function requireIdentity() {
  if (!identity) throw new Error("This action requires a live backend.");
  return identity;
}
