const { 
  detectRomanizedLanguage, 
  detectScriptLanguage, 
  isPrimarilyEnglish, 
  translateSymptomsToEnglish 
} = require('./services/translationService');

const testCases = [
  // Hindi Romanized
  { text: "mujhe sir dard hai", expectedLang: "hi" },
  { text: "mere pet mein dard ho raha hai", expectedLang: "hi" },
  { text: "mujhe do din se bukhar hai", expectedLang: "hi" },
  { text: "saans lene mein dikkat ho rahi hai", expectedLang: "hi" },
  { text: "ulti bhi ho rahi hai", expectedLang: "hi" },

  // Gujarati Romanized
  { text: "mane mathu dukhe chhe", expectedLang: "gu" },
  { text: "maru pet dukhe chhe", expectedLang: "gu" },
  { text: "mane be divas thi taav chhe", expectedLang: "gu" },
  { text: "mane shwas levama taklif pade chhe", expectedLang: "gu" },
  { text: "have mane taav pan chhe", expectedLang: "gu" },

  // Mixed
  { text: "mujhe fever hai aur body pain bhi hai", expectedLang: "hi" },
  { text: "mane headache ane ulti thay chhe", expectedLang: "gu" },

  // English
  { text: "severe headache and vomiting for 2 days", expectedLang: "en" },
  { text: "chest pain while walking", expectedLang: "en" },

  // Native script
  { text: "मुझे बहुत तेज सिरदर्द है", expectedLang: "hi" },
  { text: "મને ખૂબ માથું દુખે છે", expectedLang: "gu" }
];

console.log("=== ROMANIZED DETECTION HEURISTIC TESTS ===");
let passed = 0;
for (const tc of testCases) {
  const script = detectScriptLanguage(tc.text);
  const romanized = detectRomanizedLanguage(tc.text);
  const detected = script || romanized || (isPrimarilyEnglish(tc.text) ? 'en' : 'unknown');
  const ok = detected === tc.expectedLang;
  if (ok) passed++;
  console.log(`${ok ? '✓ PASS' : '✗ FAIL'}: "${tc.text}" -> detected: ${detected} (expected: ${tc.expectedLang})`);
}
console.log(`\nResults: ${passed} / ${testCases.length} passed.`);

if (passed !== testCases.length) {
  process.exit(1);
} else {
  console.log("ALL HEURISTIC TESTS PASSED!");
}
