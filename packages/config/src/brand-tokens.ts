export const ebenBrand = {
  primary: "#0D5E27",
  primaryDark: "#0B4A20",
  primaryDeep: "#083516",
  accentGold: "#D2A850",
  accentSun: "#EEA534",
  accentBlue: "#3699C9",
  ink: "#1E1E1E",
  surface: "#F7F8F6",
  onPrimary: "#FFFFFF",
  onSurface: "#1E1E1E",
} as const;

// Semantic roles: brand accents are not automatically suitable as text colors.
export const colors = {
  background: ebenBrand.surface,
  surface: "#FFFFFF",
  surfaceAlt: "#EAF1E9",
  text: ebenBrand.ink,
  muted: "#526052",
  primary: ebenBrand.primary,
  primaryPressed: ebenBrand.primaryDark,
  onPrimary: ebenBrand.onPrimary,
  border: "#758575",
  gold: ebenBrand.accentGold,
  warning: "#785510",
  info: "#21678C",
  danger: "#B42318",
  dangerPressed: "#8A1C13",
  dangerSurface: "#FFF0ED",
  infoSurface: "#EAF4FA",
} as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const typography = {
  title: { fontSize: 28, lineHeight: 36, fontWeight: "800" },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
} as const;
export const layout = { touchTarget: 48, contentWidth: 600, radius: 12 } as const;
