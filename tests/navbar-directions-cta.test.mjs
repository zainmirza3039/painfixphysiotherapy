import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navbar = readFileSync(new URL("../src/components/site/Navbar.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

test("clinic directions remain available inside the minimal navigation panel", () => {
  assert.match(navbar, /href=\{MAP_DIRECTIONS_URL\}/);
  assert.match(navbar, /Get directions/);
  assert.match(navbar, /target="_blank"/);
  assert.match(navbar, /rel="noopener noreferrer"/);
  assert.match(navbar, /aria-label="Open PainFix navigation"/);
});

test("public navigation uses a compact menu trigger rather than a persistent link row", () => {
  assert.match(navbar, /DialogPrimitive\.Root/);
  assert.match(navbar, /aria-expanded=\{menuOpen\}/);
  assert.match(navbar, /Explore PainFix/);
  assert.match(navbar, /Services/);
  assert.match(navbar, /Conditions/);
  assert.doesNotMatch(navbar, /hidden items-center gap-0\.5 xl:flex/);
});

test("touch feedback is subtle and respects reduced-motion preferences", () => {
  assert.match(css, /a\.apple-press:active\s*\{\s*transform: scale\(0\.985\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /scroll-behavior: auto/);
  assert.match(navbar, /className="apple-press/);
});
