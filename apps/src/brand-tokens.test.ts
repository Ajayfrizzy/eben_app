import { describe, expect, it } from "vitest";
import { colors, ebenBrand, layout } from "@eben/config";
import brand from "../../assets/brand-colors.json";
function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map((value) => {
      const n = parseInt(value, 16) / 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}
describe("official semantic brand", () => {
  it("retains the approved brand reference", () => {
    expect(ebenBrand).toEqual(brand.recommendedTokens);
    expect(colors.primary).toBe(ebenBrand.primary);
    expect(layout.touchTarget).toBeGreaterThanOrEqual(48);
  });
  it.each([
    [colors.text, colors.background],
    [colors.muted, colors.background],
    [colors.muted, colors.surfaceAlt],
    [colors.primary, colors.surface],
    [colors.onPrimary, colors.primary],
    [colors.onPrimary, colors.primaryPressed],
    [colors.onPrimary, colors.danger],
    [colors.danger, colors.dangerSurface],
    [colors.info, colors.infoSurface],
    [colors.warning, colors.surface],
  ])("keeps normal text contrast >= 4.5:1 (%s on %s)", (fg, bg) => {
    const values = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
    expect((values[0]! + 0.05) / (values[1]! + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
  it("keeps input boundaries distinguishable from their surface", () => {
    expect(
      (luminance(colors.surface) + 0.05) / (luminance(colors.border) + 0.05),
    ).toBeGreaterThanOrEqual(3);
  });
});
