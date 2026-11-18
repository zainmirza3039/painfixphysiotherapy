import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const parentRoute = fs.readFileSync(
  path.join(root, "src/routes/_authenticated/admin.personal-patients.tsx"),
  "utf8",
);
const detailRoute = fs.readFileSync(
  path.join(root, "src/routes/_authenticated/admin.personal-patients.$patientId.tsx"),
  "utf8",
);
const routeTree = fs.readFileSync(path.join(root, "src/routeTree.gen.ts"), "utf8");

test("personal patient detail route is rendered through its parent outlet", () => {
  assert.match(parentRoute, /\bOutlet\b/);
  assert.match(parentRoute, /<Outlet\s*\/>/);
  assert.match(parentRoute, /useRouterState/);
  assert.match(parentRoute, /pathname\s*===\s*["']\/admin\/personal-patients["']/);
  assert.match(
    detailRoute,
    /createFileRoute\(["']\/_authenticated\/admin\/personal-patients\/\$patientId["']\)/,
  );
  assert.match(routeTree, /fullPath: ["']\/admin\/personal-patients\/\$patientId["']/);
});

test("personal patient cards link to the registered patient detail route", () => {
  assert.match(parentRoute, /to=["']\/admin\/personal-patients\/\$patientId["']/);
  assert.match(parentRoute, /params=\{\{\s*patientId:\s*p\.id\s*\}\}/);
});
