/**
 * Automated Python vs Node.js Parity Verification Test
 * Benchmarks inference probabilities across 117 diverse queries and all 56 classes.
 * Asserts maximum probability difference <= 1e-6.
 */

const fs = require('fs');
const path = require('path');
const { loadModel, vectorize, sigmoid } = require('./models/symptomModel');

console.log('===================================================================');
console.log('PYTHON VS NODE.JS INFERENCE PARITY VERIFICATION SUITE');
console.log('===================================================================\n');

const parityCasesPath = path.join(__dirname, 'parity_inputs.json');
if (!fs.existsSync(parityCasesPath)) {
  console.error(`ERROR: Parity cases file not found at ${parityCasesPath}`);
  process.exit(1);
}

const testCases = JSON.parse(fs.readFileSync(parityCasesPath, 'utf8'));
const model = loadModel('_MedP_AI_V2.0');

if (!model) {
  console.error('ERROR: Could not load Model 2.0 JSON artifact');
  process.exit(1);
}

console.log(`Loaded ${testCases.length} test queries from parity_inputs.json.`);
console.log(`Model 2.0 classes count: ${model.classesCount}`);
console.log(`Vocabulary size: ${Object.keys(model.vectorizer.vocabulary).length}\n`);

let totalComparisons = 0;
let maxDiff = 0.0;
let sumDiff = 0.0;
let topClassMatches = 0;
const diffDistribution = {
  '< 1e-12': 0,
  '< 1e-9': 0,
  '< 1e-6': 0,
  '>= 1e-6': 0,
};

testCases.forEach((tc, testIndex) => {
  const query = tc.query;
  const pyProbs = tc.python_probabilities;
  const vector = vectorize(query, model.vectorizer);

  // Compute exact sigmoid probabilities in Node.js
  const scores = model.classifier.coef.map((row, index) =>
    row.reduce((sum, value, featureIndex) => sum + value * vector[featureIndex], model.classifier.intercept[index])
  );
  const nodeProbs = scores.map(sigmoid);

  let nodeTopIdx = 0;
  let nodeTopProb = -1;

  for (let c = 0; c < 56; c += 1) {
    const pyP = pyProbs[c];
    const nodeP = nodeProbs[c];
    const diff = Math.abs(pyP - nodeP);

    totalComparisons += 1;
    sumDiff += diff;
    if (diff > maxDiff) maxDiff = diff;

    if (diff < 1e-12) diffDistribution['< 1e-12'] += 1;
    else if (diff < 1e-9) diffDistribution['< 1e-9'] += 1;
    else if (diff < 1e-6) diffDistribution['< 1e-6'] += 1;
    else diffDistribution['>= 1e-6'] += 1;

    if (nodeP > nodeTopProb) {
      nodeTopProb = nodeP;
      nodeTopIdx = c;
    }
  }

  const nodeTopClass = model.labels[nodeTopIdx].condition;
  if (nodeTopClass === tc.top_class) {
    topClassMatches += 1;
  } else {
    console.warn(`Mismatch in top class for query "${query}": Python=${tc.top_class} vs Node=${nodeTopClass}`);
  }
});

const avgDiff = sumDiff / totalComparisons;

console.log('=== Parity Verification Results ===');
console.log(`Total queries tested:          ${testCases.length}`);
console.log(`Total class-wise comparisons:  ${totalComparisons}`);
console.log(`Top predicted class match:     ${topClassMatches} / ${testCases.length} (${(topClassMatches / testCases.length * 100).toFixed(2)}%)`);
console.log(`Maximum absolute difference:   ${maxDiff.toExponential(4)}`);
console.log(`Mean absolute difference:      ${avgDiff.toExponential(4)}`);
console.log('\nAbsolute Difference Breakdown:');
Object.entries(diffDistribution).forEach(([range, count]) => {
  console.log(`  ${range.padEnd(12)}: ${count.toString().padStart(6)} (${(count / totalComparisons * 100).toFixed(2)}%)`);
});

const passed = maxDiff <= 1e-6 && topClassMatches === testCases.length;

if (passed) {
  console.log('\n>>> PARITY TEST PASSED! Node.js inference is numerically identical to Python (max diff <= 1e-6) <<<');
} else {
  console.error('\n>>> PARITY TEST FAILED! Maximum allowed difference (1e-6) exceeded or top class mismatch! <<<');
  process.exit(1);
}
