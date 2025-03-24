// Global submission timestamp tracker for rate limiting
let submissionTimes = [];

// Offensive/spam word list (customizable)
const spamList = [
  "idiot", "stupid", "asdf", "test", "!!!", "123456",
  "fake", "not real", "this is a joke", "xxxxx", "bad"
];

// Main validation function: returns true if the report should be blocked
function isFakeReport(report) {
  if (isMissingField(report)) {
    alert("Missing required fields. Please complete all information.");
    return true;
  }

  if (containsOffensiveContent(report.desc)) {
    alert("Invalid content in the description.");
    return true;
  }

  if (exceededSubmissionLimit()) {
    alert("Too many reports submitted. Please wait.");
    return true;
  }

  if (isOutsideServiceArea(report.postalCode)) {
    alert("Invalid postal code format or outside supported area.");
    return true;
  }

  return false; // All checks passed
}

// G.1: Required fields check
function isMissingField(report) {
  return !report.desc || !report.latlng;
}

// G.2: Offensive or spam content check
function containsOffensiveContent(desc) {
  const lower = desc.toLowerCase();
  return spamList.some(word => lower.includes(word));
}

// G.3: Submission frequency limit (no more than 3 reports per minute)
function exceededSubmissionLimit() {
  const now = Date.now();
  submissionTimes = submissionTimes.filter(t => now - t < 60000);
  submissionTimes.push(now);
  return submissionTimes.length > 3;
}

// G.4: Postal code format check (must match format: A1A1A1, no spaces)
function isOutsideServiceArea(postalCode) {
  const cleaned = postalCode.toUpperCase().replace(/\s+/g, "");
  const validPostalRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/;
  return !validPostalRegex.test(cleaned);
}
