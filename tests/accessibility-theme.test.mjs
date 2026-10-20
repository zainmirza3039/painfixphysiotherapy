import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const tokens = (selector) => {
  const block = css.match(new RegExp(`${selector} \\{([^}]+)\\}`))[1];
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+): (#[\da-f]{6});/gi)].map((m) => [m[1], m[2]]),
  );
};
const light = tokens(":root");
const dark = { ...light, ...tokens("\\.dark") };
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const luminance = (color) =>
  color
    .map((x) => x / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) =>
  (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
const blend = (fg, bg, alpha) => fg.map((x, i) => x * alpha + bg[i] * (1 - alpha));
const meets = (fg, bg, minimum, label) =>
  assert.ok(
    contrast(fg, bg) >= minimum,
    `${label}: ${contrast(fg, bg).toFixed(2)}:1 < ${minimum}:1`,
  );

for (const [name, theme] of Object.entries({ light, dark })) {
  test(`${name}: normal text and semantic links meet AA on supported surfaces`, () => {
    for (const surface of ["background", "surface", "card", "muted", "accent"]) {
      for (const text of [
        "foreground",
        "muted-foreground",
        "primary",
        "secondary",
        "destructive",
      ]) {
        meets(rgb(theme[text]), rgb(theme[surface]), 4.5, `${text} on ${surface}`);
      }
    }
  });
  test(`${name}: filled control labels and hover states meet AA`, () => {
    for (const role of ["primary", "secondary", "destructive"]) {
      meets(rgb(theme[`${role}-foreground`]), rgb(theme[role]), 4.5, role);
      for (const surface of ["background", "card"]) {
        meets(
          rgb(theme[`${role}-foreground`]),
          blend(rgb(theme[role]), rgb(theme[surface]), 0.9),
          4.5,
          `${role}/90 hover`,
        );
      }
    }
  });
  test(`${name}: input boundaries and focus indicators remain distinguishable`, () => {
    for (const surface of ["background", "card", "surface", "muted"]) {
      meets(rgb(theme.input), rgb(theme[surface]), 3, `input on ${surface}`);
      meets(rgb(theme.ring), rgb(theme[surface]), 3, `focus on ${surface}`);
    }
  });
}

test("inverse footer text, accents, and focus meet AA on fixed navy", () => {
  const navy = rgb("#032e61");
  for (const alpha of [0.75, 0.8, 0.95, 1])
    meets(blend(rgb("#ffffff"), navy, alpha), navy, 4.5, `white/${alpha}`);
  meets(rgb("#8ce8b5"), navy, 4.5, "inverse accent and focus");
  meets(rgb("#091b2d"), rgb("#00a859"), 4.5, "home-visit green hover");
});

test("featured badge remains readable on its tinted surface", () => {
  for (const theme of [light, dark])
    meets(
      rgb(theme.secondary),
      blend(rgb(theme.secondary), rgb(theme.card), 0.1),
      4.5,
      "featured badge",
    );
});
