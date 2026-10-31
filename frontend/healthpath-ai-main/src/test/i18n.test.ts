import { describe, it, expect } from "vitest";
import { t } from "../lib/i18n";

describe("i18n Localization System", () => {
  it("translates common keys into English, Hindi, and Gujarati", () => {
    // Brand & Header
    expect(t("brand_title", "en")).toBe("MediPath AI");
    expect(t("brand_title", "hi")).toBe("मेडीपाथ एआई");
    expect(t("brand_title", "gu")).toBe("મેડીપાથ AI");

    // Consultation & Confidence
    expect(t("model_confidence", "en")).toBe("Model Confidence");
    expect(t("model_confidence", "hi")).toBe("मॉडल विश्वसनीयता");
    expect(t("model_confidence", "gu")).toBe("મોડેલ આત્મવિશ્વાસ");

    // Hospital Search & Filters
    expect(t("filter_hospitals", "en")).toBe("Filter Hospitals");
    expect(t("filter_hospitals", "hi")).toBe("अस्पतालों को फ़िल्टर करें");
    expect(t("filter_hospitals", "gu")).toBe("હોસ્પિટલો ફિલ્ટર કરો");

    // Action Controls
    expect(t("no_more_symptoms", "en")).toBe("No more symptoms (View Results)");
    expect(t("no_more_symptoms", "hi")).toBe("और कोई लक्षण नहीं (परिणाम देखें)");
    expect(t("no_more_symptoms", "gu")).toBe("વધુ કોઈ લક્ષણો નથી (પરિણામો જુઓ)");
  });

  it("replaces template parameters accurately", () => {
    const enText = t("hospitals_near_location", "en", { count: 8, location: "Surat" });
    expect(enText).toBe("8 hospitals near Surat");

    const hiText = t("hospitals_near_location", "hi", { count: 8, location: "सूरत" });
    expect(hiText).toBe("सूरत के पास 8 अस्पताल मिले");

    const guText = t("hospitals_near_location", "gu", { count: 8, location: "સુરત" });
    expect(guText).toBe("સુરત નજીક 8 હોસ્પિટલો મળી");
  });

  it("safely falls back to English when language or key is missing", () => {
    // Missing key in French falls back to key or English
    const fallback = t("model_confidence", "fr");
    expect(fallback).toBe("Model Confidence");

    // Non-existent key returns key name
    const unknownKey = t("non_existent_key_xyz", "en");
    expect(unknownKey).toBe("non_existent_key_xyz");
  });
});
