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
  const navy = rgb("#123b5a");
  for (const alpha of [0.75, 0.8, 0.95, 1])
    meets(blend(rgb("#ffffff"), navy, alpha), navy, 4.5, `white/${alpha}`);
  meets(rgb("#9be6c0"), navy, 4.5, "inverse accent and focus");
  meets(rgb("#091b2d"), rgb("#2ea66a"), 4.5, "home-visit green hover");
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

test("public calculator and newsletter fields use the verified input boundary token", () => {
  for (const component of [
    "BmiCalculator",
    "HealthCalculators",
    "FitnessAssessmentTools",
    "Newsletter",
  ]) {
    const source = readFileSync(
      new URL(`../src/components/site/${component}.tsx`, import.meta.url),
      "utf8",
    );
    assert.ok(
      source.includes("w-full rounded-xl border border-input bg-background px-4 py-2.5"),
      `${component} uses border-input`,
    );
    assert.ok(
      !source.includes("w-full rounded-xl border border-border bg-background px-4 py-2.5"),
      `${component} does not use decorative field boundaries`,
    );
  }
});

test("light-mode palette and gradients remain unchanged by the dark theme", () => {
  assert.deepEqual(light, {
    background: "#fcfbf8",
    foreground: "#173248",
    surface: "#f1f5f2",
    card: "#ffffff",
    "card-foreground": "#173248",
    popover: "#ffffff",
    "popover-foreground": "#173248",
    primary: "#123b5a",
    "primary-foreground": "#ffffff",
    "primary-glow": "#2a6284",
    secondary: "#0b764b",
    "secondary-foreground": "#ffffff",
    "secondary-glow": "#2ea66a",
    "brand-green": "#2ea66a",
    muted: "#edf2ef",
    "muted-foreground": "#536a78",
    accent: "#e5f1ea",
    "accent-foreground": "#123b5a",
    destructive: "#b42318",
    "destructive-foreground": "#ffffff",
    border: "#d6e0db",
    input: "#718b82",
    ring: "#0b764b",
  });
  const root = css.match(/:root \{([^}]+)\}/)[1];
  for (const declaration of [
    "--gradient-hero: linear-gradient(110deg, #123b5a, #0b764b);",
    "--gradient-blue: linear-gradient(135deg, #123b5a, #2a6284);",
    "--gradient-teal: linear-gradient(135deg, #0b764b, #2ea66a);",
    "--gradient-brand-soft: linear-gradient(135deg, #edf4f1, #f5f7f4);",
  ])
    assert.ok(root.includes(declaration), declaration);
});

test("dark brand accents, secondary/80 hover, and raised surfaces retain contrast", () => {
  assert.equal(dark["brand-green"], "#2ea66a");
  assert.equal(dark["primary-foreground"], "#123b5a");
  assert.notEqual(dark.background, dark.surface);
  assert.notEqual(dark.surface, dark.card);
  for (const surface of ["background", "surface", "card", "muted", "accent", "popover"]) {
    meets(
      rgb(dark["secondary-foreground"]),
      blend(rgb(dark.secondary), rgb(dark[surface]), 0.8),
      4.5,
      `secondary/80 on ${surface}`,
    );
    meets(rgb(dark.input), rgb(dark[surface]), 3, `input on ${surface}`);
    meets(rgb(dark.ring), rgb(dark[surface]), 3, `focus on ${surface}`);
  }
  for (const surface of ["background", "surface", "card"])
    meets(rgb(dark["brand-green"]), rgb(dark[surface]), 3, `brand marker on ${surface}`);
});

test("dark text gradients and inverse navy panels keep readable labels", () => {
  const block = css.match(/\.dark \{([^}]+)\}/)[1];
  for (const gradient of ["hero", "teal"]) {
    const stops = block
      .match(new RegExp(`--gradient-${gradient}: ([^;]+);`))[1]
      .match(/#[\da-f]{6}/gi);
    for (const stop of stops)
      for (const surface of ["background", "surface", "card", "muted", "accent"])
        meets(rgb(stop), rgb(dark[surface]), 4.5, `${gradient} stop ${stop} on ${surface}`);
  }
  const panel = css.match(/\.dark \.bg-gradient-to-br\.from-primary\.to-secondary \{([^}]+)\}/)[1];
  assert.ok(panel.includes("background-color: #123b5a;"));
  assert.ok(panel.includes("background-image: none;"));
  assert.ok(panel.includes("--primary-foreground: #f5f8f7;"));
  const navy = rgb("#123b5a");
  meets(rgb("#f5f8f7"), navy, 4.5, "inverse panel label");
  meets(blend(rgb("#f5f8f7"), navy, 0.75), navy, 4.5, "inverse panel muted label");
  meets(rgb(dark.ring), navy, 3, "inverse panel focus");
});
