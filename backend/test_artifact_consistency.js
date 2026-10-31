/**
 * Automated Model 2.0 Artifact Consistency Test
 * Compares and verifies that all machine-readable artifacts describe the EXACT same build and split:
 * - Build ID
 * - Dataset SHA-256 hash
 * - Split sizes (train, val, test, total)
 * - Per-class support (all 56 classes)
 * - Model class order
 * - Thresholds
 * - Test metrics
 * - Artifact presence and non-empty checksums
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('===================================================================');
console.log('MODEL 2.0 ARTIFACT CONSISTENCY & BUILD HARMONIZATION SUITE');
console.log('===================================================================\n');

const MODEL_DIR = path.join(__dirname, 'models', 'MedP_AI_V2.0');

// Required files
const requiredFiles = [
  'symptom-model_MedP_AI_V2.0.json',
  'symptom-model_MedP_AI_V2.0.joblib',
  'model_training_report.json',
  'model_benchmark_results.json',
  'model_per_class_metrics.csv',
  'split_class_support.csv',
  'model_validation_cases.json',
];

const errors = [];
let checksPassed = 0;

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
    console.error(`  [FAIL] ${message}`);
  } else {
    checksPassed += 1;
    console.log(`  [PASS] ${message}`);
  }
}

// 1. Verify existence and non-zero size of all artifacts
console.log('1. Checking artifact presence and checksums...');
const fileHashes = {};
for (const fname of requiredFiles) {
  const fpath = path.join(MODEL_DIR, fname);
  const exists = fs.existsSync(fpath);
  assert(exists, `File exists: ${fname}`);
  if (exists) {
    const content = fs.readFileSync(fpath);
    assert(content.length > 0, `File has content (>0 bytes): ${fname} (${content.length.toLocaleString()} bytes)`);
    fileHashes[fname] = crypto.createHash('sha256').update(content).digest('hex');
  }
}

// 2. Load JSON artifacts
const modelJson = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, 'symptom-model_MedP_AI_V2.0.json'), 'utf8'));
const trainingReport = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, 'model_training_report.json'), 'utf8'));
const benchmarkResults = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, 'model_benchmark_results.json'), 'utf8'));

// 3. Verify Build ID and Dataset Hash
console.log('\n2. Verifying Build ID and Dataset Hash alignment...');
const expectedBuildId = trainingReport.buildId;
const expectedDatasetSha256 = trainingReport.datasetSha256;

assert(Boolean(expectedBuildId), `Build ID present: ${expectedBuildId}`);
assert(Boolean(expectedDatasetSha256), `Dataset SHA-256 present: ${expectedDatasetSha256}`);
assert(modelJson.buildId === expectedBuildId, `JSON model buildId (${modelJson.buildId}) matches training report (${expectedBuildId})`);
assert(modelJson.datasetSha256 === expectedDatasetSha256, `JSON model datasetSha256 matches training report`);

// 4. Verify Split Sizes
console.log('\n3. Verifying Partitioning and Split Record Counts...');
const sp = trainingReport.splitInfo;
const expectedTrain = sp.train_records;
const expectedVal = sp.val_records;
const expectedTest = sp.test_records;
const expectedTotal = trainingReport.cleaningReport.retained_row_count;

assert(expectedTrain === 72741, `Train records equals 72,741 (got ${expectedTrain})`);
assert(expectedVal === 15786, `Val records equals 15,786 (got ${expectedVal})`);
assert(expectedTest === 15764, `Test records equals 15,764 (got ${expectedTest})`);
assert(expectedTrain + expectedVal + expectedTest === expectedTotal, `Sum of splits (${expectedTrain + expectedVal + expectedTest}) equals retained count (${expectedTotal})`);
assert(modelJson.split.train_records === expectedTrain, `Model JSON train records match training report`);
assert(modelJson.split.val_records === expectedVal, `Model JSON val records match training report`);
assert(modelJson.split.test_records === expectedTest, `Model JSON test records match training report`);

// 5. Verify Model Class Order & Count (all 56 classes)
console.log('\n4. Verifying Model Class Order and Taxonomy (56 canonical classes)...');
assert(modelJson.classesCount === 56, `Model classesCount is 56 (got ${modelJson.classesCount})`);
assert(modelJson.labels.length === 56, `Model labels count is 56 (got ${modelJson.labels.length})`);
assert(sp.class_support.length === 56, `Training report class_support count is 56 (got ${sp.class_support.length})`);

// 6. Verify Per-Class Support in split_class_support.csv
console.log('\n5. Verifying split_class_support.csv alignment...');
const splitCsvText = fs.readFileSync(path.join(MODEL_DIR, 'split_class_support.csv'), 'utf8');
const csvLines = splitCsvText.trim().split('\n');
assert(csvLines.length === 57, `split_class_support.csv has 57 lines (header + 56 classes, got ${csvLines.length})`);

const csvHeader = csvLines[0];
assert(csvHeader.includes('canonical_class') && csvHeader.includes('train_records'), `CSV has valid header columns: ${csvHeader}`);

// Map CSV lines
const csvRecords = {};
for (let i = 1; i < csvLines.length; i++) {
  const line = csvLines[i];
  const parts = line.split(',');
  const condition = parts[0].replace(/"/g, '').trim();
  const classIndex = parseInt(parts[1], 10);
  const total = parseInt(parts[2], 10);
  const train = parseInt(parts[3], 10);
  const val = parseInt(parts[4], 10);
  const test = parseInt(parts[5], 10);
  csvRecords[condition] = { classIndex, total, train, val, test };
}

// Compare CSV against trainingReport.splitInfo.class_support
for (const cs of sp.class_support) {
  const csvEntry = csvRecords[cs.condition];
  assert(Boolean(csvEntry), `CSV contains condition: "${cs.condition}"`);
  if (csvEntry) {
    assert(csvEntry.total === cs.total, `Class "${cs.condition}" total records (${csvEntry.total}) matches report (${cs.total})`);
    assert(csvEntry.train === cs.train_support, `Class "${cs.condition}" train support (${csvEntry.train}) matches report (${cs.train_support})`);
    assert(csvEntry.val === cs.val_support, `Class "${cs.condition}" val support (${csvEntry.val}) matches report (${cs.val_support})`);
    assert(csvEntry.test === cs.test_support, `Class "${cs.condition}" test support (${csvEntry.test}) matches report (${cs.test_support})`);
  }
}

// 7. Verify Thresholds and Per-Class Metrics in model_per_class_metrics.csv
console.log('\n6. Verifying model_per_class_metrics.csv thresholds and class order...');
const metricsCsvText = fs.readFileSync(path.join(MODEL_DIR, 'model_per_class_metrics.csv'), 'utf8');
const metricLines = metricsCsvText.trim().split('\n');
assert(metricLines.length === 57, `model_per_class_metrics.csv has 57 lines (got ${metricLines.length})`);

const metricRecords = {};
for (let i = 1; i < metricLines.length; i++) {
  const parts = metricLines[i].split(',');
  const cIdx = parseInt(parts[0], 10);
  const cName = parts[1].replace(/"/g, '').trim();
  const threshold = parseFloat(parts[3]);
  const support = parseInt(parts[4], 10);
  const f1 = parseFloat(parts[11]);
  metricRecords[cName] = { cIdx, threshold, support, f1 };
}

modelJson.labels.forEach((label, idx) => {
  const metric = metricRecords[label.condition];
  assert(Boolean(metric), `Metrics CSV contains class index ${idx}: "${label.condition}"`);
  if (metric) {
    assert(metric.cIdx === idx, `Class index for "${label.condition}" matches (${metric.cIdx} === ${idx})`);
    assert(Math.abs(metric.threshold - label.threshold) < 1e-4, `Threshold for "${label.condition}" matches (${metric.threshold} === ${label.threshold})`);
    assert(metric.support === sp.class_support[idx].test_support, `Test support for "${label.condition}" matches (${metric.support} === ${sp.class_support[idx].test_support})`);
  }
});

// 7. Verify Benchmark Results and Test Set Metrics
console.log('\n6. Verifying benchmark and test set metrics consistency across artifacts...');
assert(JSON.stringify(trainingReport.benchmarkResults) === JSON.stringify(benchmarkResults), 'model_benchmark_results.json exactly matches trainingReport.benchmarkResults');
assert(JSON.stringify(modelJson.testMetrics) === JSON.stringify(trainingReport.testMetrics), 'symptom-model_MedP_AI_V2.0.json testMetrics exactly matches trainingReport.testMetrics');

const tm = trainingReport.testMetrics;
assert(typeof tm.macro_f1 === 'number' && tm.macro_f1 > 0.70, `Test Macro F1 is valid (${tm.macro_f1})`);
assert(typeof tm.micro_f1 === 'number' && tm.micro_f1 > 0.75, `Test Micro F1 is valid (${tm.micro_f1})`);
assert(typeof tm.lrap === 'number' && tm.lrap > 0.90, `Test LRAP is valid (${tm.lrap})`);
assert(typeof tm.hamming_loss === 'number' && tm.hamming_loss < 0.02, `Test Hamming Loss is valid (${tm.hamming_loss})`);
assert(typeof tm.top1_hit_rate === 'number' && tm.top1_hit_rate > 0.85, `Test Top-1 Hit Rate is valid (${tm.top1_hit_rate})`);


console.log('\n===================================================================');
if (errors.length > 0) {
  console.error(`FAILED: ${errors.length} artifact consistency checks failed!`);
  process.exit(1);
} else {
  console.log(`ALL CHECKS PASSED: ${checksPassed} consistency assertions verified!`);
  console.log('All model artifacts belong to the EXACT same build and split.');
  console.log('===================================================================\n');
}
