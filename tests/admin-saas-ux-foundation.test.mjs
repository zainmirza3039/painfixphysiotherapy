import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { debounce, throttle } from "../src/lib/interaction-scheduling.ts";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const source = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("debounce keeps only the latest arguments in a burst", async () => {
  const calls = [];
  const run = debounce((value) => calls.push(value), 15);
  run("first");
  run("latest");
  await wait(30);
  assert.deepEqual(calls, ["latest"]);
});

test("debounce supports cancel and flush", async () => {
  const calls = [];
  const run = debounce((value) => calls.push(value), 30);
  run("cancelled");
  run.cancel();
  run("flushed");
  run.flush();
  await wait(40);
  assert.deepEqual(calls, ["flushed"]);
});

test("throttle runs immediately and coalesces rapid calls to the latest trailing value", async () => {
  const calls = [];
  const run = throttle((value) => calls.push(value), 25);
  run("leading");
  run("intermediate");
  run("latest");
  await wait(40);
  assert.deepEqual(calls, ["leading", "latest"]);
});

test("throttle cancellation prevents a queued trailing call", async () => {
  const calls = [];
  const run = throttle((value) => calls.push(value), 30);
  run("leading");
  run("cancelled");
  run.cancel();
  await wait(40);
  assert.deepEqual(calls, ["leading"]);
});

test("admin shell exposes a role-filtered command palette and persistent desktop navigation", () => {
  const shell = source("components/admin/AdminShell.tsx");
  assert.match(shell, /lg:flex/);
  assert.match(shell, /sticky top-0 hidden h-screen w-\[272px\]/);
  assert.match(shell, /CommandDialog open=\{commandOpen\}/);
  assert.match(shell, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(shell, /setCommandOpen\(\(open\) => !open\)/);
  assert.match(shell, /const items = NAV\.filter/);
  assert.match(shell, /items\.map\(\(item\) => \(/);
  assert.match(shell, /<Sheet open=\{mobileOpen\}/);
});

test("root route retains dedicated not-found and recoverable error views", () => {
  const root = source("routes/__root.tsx");
  assert.match(root, /notFoundComponent: NotFoundComponent/);
  assert.match(root, /errorComponent: ErrorComponent/);
  assert.match(root, /router\.invalidate\(\)/);
  assert.match(root, /Try again/);
});
