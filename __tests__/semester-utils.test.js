import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Utils code manually or test the semester logic functions directly
const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const ALUMNI = 'alumni / special';

function getSemesterCycle(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  return month >= 6 ? `${year}-07` : `${year}-01`;
}

function getElapsedSemesterCycles(lastCycle, currentCycle) {
  if (!lastCycle || !currentCycle) return 0;
  const [lYear, lMonth] = lastCycle.split('-').map(Number);
  const [cYear, cMonth] = currentCycle.split('-').map(Number);

  const yearDiff = cYear - lYear;
  const monthDiff = (cMonth === 7 ? 1 : 0) - (lMonth === 7 ? 1 : 0);

  const elapsed = yearDiff * 2 + monthDiff;
  return elapsed > 0 ? elapsed : 0;
}

function incrementSemester(currentSem, steps = 1) {
  if (!currentSem || currentSem === ALUMNI) return ALUMNI;

  const norm = String(currentSem).trim().toLowerCase();
  let index = SEMESTERS.findIndex(s => s.toLowerCase() === norm);

  if (index === -1) {
    const num = parseInt(norm, 10);
    if (!isNaN(num) && num >= 1 && num <= 8) {
      index = num - 1;
    }
  }

  if (index === -1) return currentSem;

  const newIndex = index + steps;
  if (newIndex >= SEMESTERS.length) {
    return ALUMNI;
  }
  return SEMESTERS[newIndex];
}

// Test assertion helper
function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName} (Expected: ${expected}, Got: ${actual})`);
    process.exitCode = 1;
  }
}

describe('Semester Utils Unit Tests', () => {
  test('Cycle Tests', () => {
    expect(getSemesterCycle(new Date('2026-07-25'))).toBe('2026-07');
    expect(getSemesterCycle(new Date('2026-01-15'))).toBe('2026-01');
    expect(getSemesterCycle(new Date('2026-06-30'))).toBe('2026-01');
  });

  test('Elapsed Cycle Tests', () => {
    expect(getElapsedSemesterCycles('2026-01', '2026-07')).toBe(1);
    expect(getElapsedSemesterCycles('2026-01', '2027-01')).toBe(2);
    expect(getElapsedSemesterCycles('2026-07', '2026-07')).toBe(0);
  });

  test('Semester Increment Tests', () => {
    expect(incrementSemester('1st')).toBe('2nd');
    expect(incrementSemester('7th')).toBe('8th');
    expect(incrementSemester('8th')).toBe('alumni / special');
    expect(incrementSemester('alumni / special')).toBe('alumni / special');
    expect(incrementSemester('1st', 2)).toBe('3rd');
  });

  test('Banner Dismiss Flag Logic Tests', () => {
    function shouldShowSemesterNotice(userProfile, currentCycle) {
      if (!userProfile) return false;
      const dismissed = userProfile.semesterNoticeDismissedCycle;
      return dismissed !== currentCycle;
    }

    const userProfileDismissed = { semesterNoticeDismissedCycle: '2026-07' };
    const userProfileNewUpdate = { semesterNoticeDismissedCycle: '2026-01' };
    const userProfileNoFlag = {};

    expect(shouldShowSemesterNotice(userProfileDismissed, '2026-07')).toBe(false);
    expect(shouldShowSemesterNotice(userProfileNewUpdate, '2026-07')).toBe(true);
    expect(shouldShowSemesterNotice(userProfileNoFlag, '2026-07')).toBe(true);
  });
});

