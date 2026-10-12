import { sanitizeNativeIntent } from "../src/features/auth/native-intent";
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  return sanitizeNativeIntent(path);
}
