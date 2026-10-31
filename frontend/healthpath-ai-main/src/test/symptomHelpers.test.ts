import { describe, it, expect } from "vitest";
import { isNegativeOrNoSymptomResponse, appendRealSymptom } from "@/lib/symptomHelpers";

describe("DoctorConsultationPanel symptom helpers", () => {
  describe("isNegativeOrNoSymptomResponse", () => {
    it("should identify negative answers properly", () => {
      const negatives = [
        "None of these symptoms apply",
        "none of these symptoms apply",
        "none of these",
        "None of these",
        "no additional symptoms",
        "No additional symptoms",
        "no additional symptom",
        "no other symptoms",
        "no more symptoms",
        "No more symptoms",
        "no more symptom",
        "No more symptom",
        "no symptoms",
        "nothing",
        "nothing else",
        "none",
        "no",
        "nope",
        "nahi",
        "kuch nahi",
        "koi nahi",
        "koi aur lakshan nahi",
        "I have no additional symptoms",
        "I don't have any additional symptoms",
        "dont have other symptoms",
      ];

      for (const phrase of negatives) {
        expect(isNegativeOrNoSymptomResponse(phrase), `Expected '${phrase}' to be negative`).toBe(true);
      }
    });

    it("should identify real symptoms properly as not negative", () => {
      const realSymptoms = [
        "fever",
        "Fever or chills",
        "Cough or sore throat",
        "Eye redness or watering",
        "Stomach pain or nausea",
        "Skin rash or pimples",
        "chest pain",
        "headache",
        "vomiting",
        "blurred vision",
        "swelling around eyes",
      ];

      for (const symptom of realSymptoms) {
        expect(isNegativeOrNoSymptomResponse(symptom), `Expected '${symptom}' to NOT be negative`).toBe(false);
      }
    });
  });

  describe("appendRealSymptom", () => {
    it("should append a new symptom cleanly with a comma", () => {
      expect(appendRealSymptom("fever", "cough")).toBe("fever, cough");
    });

    it("should handle empty or whitespace initial symptoms", () => {
      expect(appendRealSymptom("", "fever")).toBe("fever");
      expect(appendRealSymptom("   ", "fever")).toBe("fever");
    });

    it("should prevent adding duplicate symptoms (case-insensitive)", () => {
      expect(appendRealSymptom("fever, cough", "cough")).toBe("fever, cough");
      expect(appendRealSymptom("fever, cough", "Cough")).toBe("fever, cough");
      expect(appendRealSymptom("fever, cough", "FEVER")).toBe("fever, cough");
    });

    it("should append multiple comma-separated symptoms without duplicates", () => {
      expect(appendRealSymptom("fever", "cough, headache")).toBe("fever, cough, headache");
      expect(appendRealSymptom("fever, cough", "cough, headache")).toBe("fever, cough, headache");
    });

    it("should trim surrounding whitespace and trailing commas", () => {
      expect(appendRealSymptom("fever, ", "  cough  ")).toBe("fever, cough");
    });
  });
});
