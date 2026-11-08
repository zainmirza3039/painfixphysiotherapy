import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navbar = readFileSync(new URL("../src/components/site/Navbar.tsx", import.meta.url), "utf8");

test("top Get Directions CTA keeps its Maps action and accessible interaction states", () => {
  const cta = navbar.match(
    /<a\s+href=\{MAP_DIRECTIONS_URL\}\s+target="_blank"\s+rel="noopener noreferrer"\s+className="([^"]+)"\s*>\s*<Navigation[^>]*\/>\s*<span>Get Directions<\/span>\s*<\/a>/,
  );

  assert.ok(cta, "Get Directions remains a link using the existing Maps URL");
  const className = cta[1];
  const classes = new Set(className.split(/\s+/));

  assert.ok(classes.has("bg-primary/10"));
  assert.ok(classes.has("hover:bg-primary/15"));
  assert.ok(classes.has("hover:-translate-y-px"));
  assert.ok(classes.has("hover:shadow-sm"));
  assert.ok(classes.has("active:scale-[0.98]"));
  assert.ok(classes.has("focus-visible:outline-none"));
  assert.ok(classes.has("focus-visible:ring-2"));
  assert.ok(classes.has("focus-visible:ring-offset-2"));
  assert.ok(classes.has("duration-150"));
});
