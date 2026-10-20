import assert from "node:assert/strict";
import test from "node:test";
import { toClinicianView } from "../src/lib/clinician-view.ts";
import {
  clinicianServiceLabel,
  clinicianWhatsAppUrl,
  isOnlineClinician,
} from "../src/lib/clinician-service.ts";
import {
  clinicianFormToInput,
  clinicianProfileToForm,
  emptyClinicianForm,
} from "../src/admin/clinician-form.ts";

const profile = {
  name: "Ariba Babar",
  full_name: "ARIBA BABAR, DPT",
  designation: "Doctor of Physical Therapy",
  professional_title: "Doctor of Physical Therapy",
  credentials: "DPT",
  slug: "ariba-babar",
  service_mode: "online_only",
  city: "Rahim Yar Khan, Pakistan",
  photo_url: null,
  whatsapp_number: "923120102560",
  phone_display: "+92 312 0102560",
  experience: ["Supervised internship"],
  training: ["Dry needling training"],
  research: ["Cross-sectional study"],
};

test("online view retains managed mode, city, CV sections and AB initials", () => {
  const doc = toClinicianView(profile);
  assert.equal(doc.initials, "AB");
  assert.equal(doc.photo, null);
  assert.equal(isOnlineClinician(doc), true);
  assert.equal(clinicianServiceLabel(doc), "Online physiotherapy · Rahim Yar Khan, Pakistan");
  assert.deepEqual(doc.profile.experience, profile.experience);
  assert.deepEqual(doc.profile.training, profile.training);
  assert.deepEqual(doc.profile.research, profile.research);
  const url = new URL(clinicianWhatsAppUrl(doc));
  assert.equal(url.pathname, "/923120102560");
  assert.match(url.searchParams.get("text"), /online physiotherapy consultation with Ariba Babar/);
  assert.doesNotMatch(url.searchParams.get("text"), /Multan|at PainFix Physiotherapy Clinic/);
});

test("legacy view and booking keep clinic defaults and original message", () => {
  const { service_mode, city, experience, training, research, ...legacy } = profile;
  const doc = toClinicianView(legacy);
  assert.equal(doc.serviceMode, "clinic");
  assert.equal(doc.city, "Multan");
  assert.deepEqual(doc.profile.experience, []);
  assert.equal(
    new URL(clinicianWhatsAppUrl(doc)).searchParams.get("text"),
    "Hi, I'd like a physiotherapy consultation with Ariba Babar at PainFix Physiotherapy Clinic.",
  );
  assert.equal(clinicianWhatsAppUrl({ ...doc, whatsapp: "" }), null);
});

test("admin conversion round-trips service mode and all CV lists without inventing claims", () => {
  const form = {
    ...emptyClinicianForm(),
    service_mode: "online_only",
    city: " Rahim Yar Khan, Pakistan ",
    experienceText: " Supervised internship\n\nSecond placement ",
    trainingText: "Dry needling training",
    researchText: " Cross-sectional study ",
  };
  const input = clinicianFormToInput(form, null);
  assert.equal(input.service_mode, "online_only");
  assert.equal(input.city, "Rahim Yar Khan, Pakistan");
  assert.deepEqual(input.experience, ["Supervised internship", "Second placement"]);
  assert.deepEqual(input.training, ["Dry needling training"]);
  assert.deepEqual(input.research, ["Cross-sectional study"]);
  const roundTrip = clinicianProfileToForm({ ...input, id: "synthetic-id" });
  assert.equal(roundTrip.service_mode, "online_only");
  assert.equal(roundTrip.trainingText, "Dry needling training");
  assert.equal(clinicianProfileToForm({}).city, "Multan");
});
