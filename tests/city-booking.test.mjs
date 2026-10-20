import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  bookingServices,
  parseBookingSearch,
  validateBookingDetails,
  bookingWhatsAppUrl,
  clinicCalendarUrl,
} from "../src/lib/city-booking.ts";
const values = {
  full_name: " Test Patient ",
  phone: "+92 312 0102560",
  address: "",
  medical_condition: "Knee pain",
  preferred_date: "2027-01-20",
  preferred_time: "12:30",
  notes: "Please advise",
};
test("Multan supports clinic, home and online; other cities cannot offer physical services", () => {
  assert.deepEqual(
    bookingServices("multan").map((s) => s.value),
    ["clinic", "home_visit", "online"],
  );
  for (const city of ["rahim-yar-khan", "other"])
    assert.deepEqual(
      bookingServices(city).map((s) => s.value),
      ["online"],
    );
  assert.deepEqual(bookingServices(""), []);
});
test("query prefills reject unknown cities and illegal city/service combinations", () => {
  assert.deepEqual(parseBookingSearch({ city: "rahim-yar-khan", service: "home_visit" }), {
    city: "rahim-yar-khan",
  });
  assert.deepEqual(parseBookingSearch({ city: "other", service: "clinic" }), { city: "other" });
  assert.deepEqual(parseBookingSearch({ city: "invalid", service: "online" }), {});
  assert.deepEqual(parseBookingSearch({ city: "multan", service: "home_visit" }), {
    city: "multan",
    service: "home_visit",
  });
});
test("enquiry validation requires details but no address, rejects bad phone/date/time", () => {
  assert.equal(validateBookingDetails(values, "2026-10-21"), null);
  for (const field of [
    "full_name",
    "phone",
    "medical_condition",
    "preferred_date",
    "preferred_time",
  ])
    assert.ok(validateBookingDetails({ ...values, [field]: "" }, "2026-10-21"));
  for (const phone of ["123", "+1234567890123456", "phone123456789"])
    assert.ok(validateBookingDetails({ ...values, phone }, "2026-10-21"));
  for (const date of ["2020-01-01", "2027-02-30", "garbage"])
    assert.ok(validateBookingDetails({ ...values, preferred_date: date }, "2026-10-21"));
  assert.ok(validateBookingDetails({ ...values, preferred_time: "25:00" }, "2026-10-21"));
});
test("Rahim Yar Khan enquiry hands off complete details to Ariba only, without address or confirmation", () => {
  const url = new URL(bookingWhatsAppUrl("rahim-yar-khan", values, "https://wa.me/923143039582"));
  assert.equal(url.pathname, "/923120102560");
  const message = url.searchParams.get("text");
  for (const part of [
    "Test Patient",
    values.phone,
    "Rahim Yar Khan",
    "Online consultation enquiry",
    values.medical_condition,
    values.preferred_date,
    values.preferred_time,
    values.notes,
    "not a confirmed appointment",
  ])
    assert.ok(message.includes(part), part);
  assert.ok(!message.includes("Address:"));
});
test("Multan and Other city online enquiries route to existing PainFix contact", () => {
  for (const city of ["multan", "other"])
    assert.equal(
      new URL(bookingWhatsAppUrl(city, values, "https://wa.me/923143039582")).pathname,
      "/923143039582",
    );
});
test("clinic retains existing calendar and only standard name prefill, no clinical data in URL", () => {
  const url = new URL(clinicCalendarUrl("https://calendly.com/zainimirza30396", values));
  assert.equal(url.origin + url.pathname, "https://calendly.com/zainimirza30396");
  assert.equal(url.searchParams.get("name"), "Test Patient");
  assert.equal(url.searchParams.size, 1);
});
test("booking delegates Multan home visits to existing form and never inserts online records", () => {
  const component = readFileSync(
    new URL("../src/components/site/CityBookingForm.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /city === "multan" && service === "home_visit"/);
  assert.match(component, /<HomeVisitForm/);
  assert.match(component, /createSingleSubmissionGuard/);
  assert.match(component, /disabled=\{ready\}/);
  assert.doesNotMatch(component, /\.insert\(|home_visit_requests/);
  const home = readFileSync(
    new URL("../src/components/site/HomeVisitForm.tsx", import.meta.url),
    "utf8",
  );
  assert.match(home, /submitHomeVisitRequest/);
  assert.match(home, /home_visit_requests/);
});
