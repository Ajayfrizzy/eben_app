# Eben Institute Brand Assets

These assets were extracted from the official Eben Institute pitch deck.

## Logo files

- `eben_logo_full.png` — full logo lockup
- `eben_logo_mark.png` — logo mark only
- `eben_logo_full_white.png` — full logo on white background
- `eben_logo_mark_white.png` — logo mark on white background

## Recommended color tokens

- `primary`: `#0D5E27`
- `primaryDark`: `#0B4A20`
- `primaryDeep`: `#083516`
- `accentGold`: `#D2A850`
- `accentSun`: `#EEA534`
- `accentBlue`: `#3699C9`
- `ink`: `#1E1E1E`
- `surface`: `#F7F8F6`
- `onPrimary`: `#FFFFFF`
- `onSurface`: `#1E1E1E`

## Suggested usage

- Main actions / buttons: `primary`
- Pressed states / strong brand surfaces: `primaryDark`
- Deep hero / splash support: `primaryDeep`
- Achievement / recognition accents: `accentGold`
- Warm supportive accents: `accentSun`
- Info/support accents: `accentBlue`
- Text on light backgrounds: `ink`
- Light cards / sheets: `surface`

## Codex note

Use these assets as the official branding references when updating Eben Institute app theme, splash, onboarding, auth, and branded UI surfaces.

## Milestone 2 application usage

`packages/config/src/brand-tokens.ts` owns semantic colors, typography, spacing and
minimum touch targets. Gold and original bright blue remain accents; darker semantic
warning/info colors are used for readable text. Components use the device system font
and preserve text scaling.

`node scripts/generate-brand-assets.cjs` produces these padded PNG derivatives using
Expo's existing image tooling (install with `npm ci` first):

- `android/icon.png`: opaque 1024 × 1024 launcher image.
- `android/adaptive-foreground.png`: transparent 1024 × 1024 layer with the entire
  source rectangle inside Android's 66/108 circular safe zone; white background is
  configured separately.
- `android/splash.png`: 512 × 512 centered artwork, configured at 240dp by the Expo
  splash-screen plugin.

The original raster emblem is scaled proportionally, never cropped or recolored.
Its original background remains visible, including in the adaptive foreground.
Source resolution is only 470 × 440 for the mark: larger exports cannot invent detail.
An organization-supplied vector or higher-resolution transparent master would improve
launcher sharpness. Verify circle/squircle masks and Android 12+ splash on an installed
build; Expo Go does not validate native splash configuration.
