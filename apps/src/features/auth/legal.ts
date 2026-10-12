export type LegalDocuments = {
  terms: string;
  privacy: string;
  termsVersion: string;
  privacyVersion: string;
  termsEffectiveDate: string;
  privacyEffectiveDate: string;
  approved: boolean;
};
export const legalDocuments: LegalDocuments = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL?.trim() ?? "",
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL?.trim() ?? "",
  termsVersion: process.env.EXPO_PUBLIC_TERMS_VERSION?.trim() ?? "",
  privacyVersion: process.env.EXPO_PUBLIC_PRIVACY_VERSION?.trim() ?? "",
  termsEffectiveDate: process.env.EXPO_PUBLIC_TERMS_EFFECTIVE_DATE?.trim() ?? "",
  privacyEffectiveDate: process.env.EXPO_PUBLIC_PRIVACY_EFFECTIVE_DATE?.trim() ?? "",
  approved: process.env.EXPO_PUBLIC_LEGAL_APPROVED === "true",
};
export function legalReady(documents = legalDocuments) {
  const dates = [documents.termsEffectiveDate, documents.privacyEffectiveDate];
  return Boolean(
    documents.approved &&
    documents.termsVersion &&
    documents.privacyVersion &&
    dates.every(
      (date) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        !Number.isNaN(Date.parse(date)) &&
        new Date(date).toISOString().slice(0, 10) === date &&
        Date.parse(date) <= Date.now(),
    ) &&
    [documents.terms, documents.privacy].every((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password;
      } catch {
        return false;
      }
    }),
  );
}
