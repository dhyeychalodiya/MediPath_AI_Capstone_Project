export function isNegativeOrNoSymptomResponse(text: string): boolean {
  if (!text) return true;
  const clean = text.trim().toLowerCase();

  const directNegatives = new Set([
    "no",
    "none",
    "nothing",
    "nope",
    "nah",
    "neither",
    "n/a",
    "na",
    "nahi",
    "kuch nahi",
    "koi nahi",
    "koi aur lakshan nahi",
    "koi lakshan nahi",
    "nothing else",
    "not really",
    "none of these",
    "none of them",
    "none of the above",
    "none of these symptoms",
    "none of these symptoms apply",
    "none apply",
    "no additional symptoms",
    "no additional symptom",
    "no other symptoms",
    "no other symptom",
    "no more symptoms",
    "no more symptom",
    "no symptoms",
    "no symptom",
    "no symptoms apply",
    // Hindi negatives
    "इनमें से कोई नहीं",
    "इनमें से कोई लागू नहीं होता",
    "और कोई लक्षण नहीं",
    "और कोई लक्षण नहीं (परिणाम देखें)",
    "कोई और लक्षण नहीं",
    "कोई लक्षण नहीं",
    "कुछ नहीं",
    "कोई अन्य लक्षण नहीं",
    // Gujarati negatives
    "વધુ કોઈ લક્ષણો નથી",
    "વધુ કોઈ લક્ષણો નથી (પરિણામો જુઓ)",
    "આમાંથી કોઈ નહીં",
    "આમાંથી કોઈ લાગુ પડતું નથી",
    "કોઈ વધુ લક્ષણો નથી",
    "બીજા કોઈ લક્ષણો નથી",
    "કંઈ નથી",
    // Bengali, Marathi, Tamil, Telugu, Kannada, Punjabi negatives
    "আর কোনো উপসর্গ নেই",
    "আর কোনো উপসর্গ নেই (ফলাফল দেখুন)",
    "এগুলির কোনোটিই নয়",
    "इतर कोणतीही लक्षणे नाहीत",
    "इतर कोणतीही लक्षणे नाहीत (निकाल पहा)",
    "यापैकी काहीही नाही",
    "வேறு எந்த அறிகுறிகளும் இல்லை",
    "வேறு எந்த அறிகுறிகளும் இல்லை (முடிவுகளைப் பார்க்கவும்)",
    "இதில் எதுவும் இல்லை",
    "ఇతర లక్షణాలు లేవు",
    "ఇతర లక్షణాలు లేవు (ఫలితాలను చూడండి)",
    "వీటిలో ఏదీ కాదు",
    "ಇನ್ನಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲ",
    "ಇನ್ನಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲ (ಫಲಿತಾಂಶ ನೋಡಿ)",
    "ਹੋਰ ਕੋਈ ਲੱਛਣ ਨਹੀਂ",
    "ਹੋਰ ਕੋਈ ਲੱਛਣ ਨਹੀਂ (ਨਤੀਜੇ ਵੇਖੋ)",
  ]);

  if (directNegatives.has(clean)) {
    return true;
  }

  const negativeRegexPatterns = [
    /\bnone\s+of\s+(these|them|the\s+above)\b/i,
    /\bno\s+(additional|other|more)\s+symptoms?\b/i,
    /\bno\s+symptoms?\s+apply\b/i,
    /\bno\s+symptoms?\b/i,
    /\bnothing\s+else\b/i,
    /\bneither\s+of\s+(these|them)\b/i,
    /\bdon'?t\s+have\s+(any|other|more|these|additional)\b/i,
    /\bdo\s+not\s+have\s+(any|other|more|these|additional)\b/i,
    /\bnot\s+experiencing\s+(any|other|these|additional)\b/i,
    /\bkuch\s+nahi\b/i,
    /\bkoi\s+(bhi\s+)?nahi\b/i,
    /(और\s*कोई\s*लक्षण\s*नहीं|इनमें\s*से\s*कोई\s*लागू\s*नहीं|इनमें\s*से\s*कोई\s*नहीं|કોઈ\s*વધુ\s*લક્ષણો\s*નથી|વધુ\s*કોઈ\s*લક્ષણો\s*નથી|આમાંથી\s*કોઈ\s*નથી|આમાંથી\s*કોઈ\s*લાગુ)/,
  ];

  return negativeRegexPatterns.some((pattern) => pattern.test(clean));
}

export function appendRealSymptom(existingSymptoms: string, newSymptom: string): string {
  if (!newSymptom || !newSymptom.trim()) return existingSymptoms || "";
  if (!existingSymptoms || !existingSymptoms.trim()) return newSymptom.trim();

  const existingParts = existingSymptoms
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const existingLowerSet = new Set(existingParts.map((s) => s.toLowerCase()));

  const newParts = newSymptom
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const part of newParts) {
    if (!existingLowerSet.has(part.toLowerCase())) {
      existingParts.push(part);
      existingLowerSet.add(part.toLowerCase());
    }
  }

  return existingParts.join(", ");
}
