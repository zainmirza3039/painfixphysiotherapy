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

test("light-mode brand palette remains stable", () => {
  assert.deepEqual(light, {
    background: "#fafaf7",
    foreground: "#16324a",
    surface: "#f0f4f1",
    card: "#ffffff",
    "card-foreground": "#16324a",
    popover: "#ffffff",
    "popover-foreground": "#16324a",
    primary: "#032e61",
    "primary-foreground": "#ffffff",
    "primary-glow": "#0b4f87",
    secondary: "#007a43",
    "secondary-foreground": "#ffffff",
    "secondary-glow": "#00a859",
    "brand-green": "#00a859",
    muted: "#eef2ef",
    "muted-foreground": "#526477",
    accent: "#e7f2eb",
    "accent-foreground": "#032e61",
    destructive: "#b42318",
    "destructive-foreground": "#ffffff",
    border: "#d7e1de",
    input: "#718579",
    ring: "#007a43",
  });
});
test("dark brand accents, secondary/80 hover, and raised surfaces retain contrast", () => {
  assert.equal(dark["brand-green"], "#00a859");
  assert.equal(dark["primary-foreground"], "#032e61");
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

test("public visual system uses a restrained radius scale and avoids decorative gradients", () => {
  assert.ok(css.includes("--radius-xl: calc(var(--radius) + 2px);"));
  assert.ok(css.includes("--radius-2xl: calc(var(--radius) + 4px);"));
  assert.ok(css.includes("--radius-3xl: calc(var(--radius) + 8px);"));
  assert.ok(!css.includes("--gradient-hero"));
  assert.ok(!css.includes("--gradient-brand-soft"));
  assert.ok(!css.includes("linear-gradient("));
});

test("public shell and conversion pages avoid glass and gradient utility treatments", () => {
  for (const path of [
    "../src/components/site/Navbar.tsx",
    "../src/components/site/Stats.tsx",
    "../src/components/site/Hero.tsx",
    "../src/routes/home-visit.tsx",
    "../src/routes/blog.$slug.tsx",
    "../src/routes/auth.tsx",
  ]) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.ok(!source.includes("backdrop-blur"), `${path} does not use glass blur`);
    assert.ok(!source.includes("bg-gradient-to-"), `${path} does not use gradient utility panels`);
  }
});
