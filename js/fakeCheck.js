// Global submission timestamp tracker for rate limiting
let submissionTimes = [];

// Offensive/spam word list (customizable)
const spamList = [
  "idiot", "stupid", "asdf", "test", "!!!", "123456",
  "fake", "not real", "this is a joke", "xxxxx", "bad"
];

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

// G.4: Postal code format check (must match format: A1A1A1, no space or with space)
function isOutsideServiceArea(postalCode) {
  const cleaned = postalCode.toUpperCase().replace(/\s+/g, "");
  const validPostalRegex = /^[A-Z]\d[A-Z]\d[A-Z]\d$/;
  return !validPostalRegex.test(cleaned);
}

// G.5: Email format check
function isInvalidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(email.trim());
}

// 🚨 NEW: Suspicious behavior scoring
function isFakeReport(report) {
  let blocked = false;
  let score = 0;
  let reason = "";

  if (containsOffensiveContent(report.desc)) {
    score += 2;
    reason = "Your description contains offensive or spam content.";
    blocked = true;
  }

  return { blocked, score, reason };
}

// ✅ Form field validation only (keep user-friendly errors)
function validateReportFields(report) {
  clearAllErrors();

  let hasError = false;

  if (isMissingField(report)) {
    setError("descError", "Description is required.");
    hasError = true;
  }

  if (!report.email) {
    setError("emailError", "Email is required.");
    hasError = true;
  } else if (isInvalidEmail(report.email)) {
    setError("emailError", "Please enter a valid email address.");
    hasError = true;
  }

  if (exceededSubmissionLimit()) {
    setError("submitError", "Too many reports submitted. Please wait.");
    hasError = true;
  }

  if (isOutsideServiceArea(report.postalCode)) {
    setError("postalCodeError", "Invalid postal code format or outside supported area.");
    hasError = true;
  }

  return hasError;
}

// 🔧 Helper: Set error message under field
function setError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.innerText = message;
}

// 🔧 Helper: Clear all previous errors
function clearAllErrors() {
  const errorFields = ["emailError", "descError", "postalCodeError", "submitError"];
  errorFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = "";
  });
}
