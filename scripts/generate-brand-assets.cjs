// Uses Expo's existing image tooling. No redraw, recoloring, stretching or cropping.
const fs = require("node:fs");
const path = require("node:path");
const Jimp = require("jimp-compact");
const root = path.resolve(__dirname, "..");
async function generate() {
  const source = await Jimp.read(path.join(root, "assets/eben_logo_mark.png"));
  for (const [name, size, artwork, background] of [
    ["icon.png", 1024, 720, 0xffffffff],
    // The whole rectangular artwork stays inside the 66dp safe-zone circle:
    // sqrt(440^2 + 412^2) < 1024 * 66 / 108.
    ["adaptive-foreground.png", 1024, 440, 0x00000000],
    ["splash.png", 512, 320, 0xffffffff],
  ]) {
    const logo = source.clone().resize(artwork, Jimp.AUTO);
    const canvas = new Jimp(size, size, background);
    canvas.composite(
      logo,
      Math.round((size - logo.bitmap.width) / 2),
      Math.round((size - logo.bitmap.height) / 2),
    );
    await canvas.writeAsync(path.join(root, "assets/android", name));
  }
}
generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
