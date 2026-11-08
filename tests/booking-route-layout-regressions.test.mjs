import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("booking route suppresses all floating actions that can cover the form", () => {
  for (const file of [
    "components/site/HomeVisitFab.tsx",
    "components/site/WhatsAppFab.tsx",
    "components/site/ConversionFab.tsx",
  ]) {
    assert.match(source(file), /pathname\s*===\s*"\/book-appointment"[\s\S]{0,200}return null/);
  }
  const bookingForm = source("components/site/CityBookingForm.tsx");
  assert.ok(bookingForm.includes('name="booking-city"'));
  assert.ok(bookingForm.includes('htmlFor="enquiry-notes"'));
  assert.ok(bookingForm.includes('type="submit"'));
});

test("booking hero links to the existing city selector without confirming an appointment", () => {
  const booking = source("routes/book-appointment.tsx");
  const hero = source("components/site/PageHero.tsx");
  assert.ok(
    booking.includes('primaryAction={{ href: "#booking-selector", label: "Choose your city" }}'),
  );
  assert.ok(booking.includes('<section id="booking-selector" className="scroll-mt-24'));
  assert.ok(hero.includes("primaryAction?: { href: string; label: string }"));
  assert.ok(hero.includes("href={primaryAction.href}"));
  assert.ok(hero.indexOf("{primaryAction &&") < hero.indexOf("{subtitle &&"));
  assert.ok(booking.includes("online physiotherapy"));
  assert.ok(booking.includes("Multan home visit"));
});
