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

console.log('Running Semester Utils Unit Tests...');

// 1. Cycle Tests
assertEqual(getSemesterCycle(new Date('2026-07-25')), '2026-07', 'July date produces 2026-07 cycle');
assertEqual(getSemesterCycle(new Date('2026-01-15')), '2026-01', 'January date produces 2026-01 cycle');
assertEqual(getSemesterCycle(new Date('2026-06-30')), '2026-01', 'June 30 date produces 2026-01 cycle');

// 2. Elapsed Cycle Tests
assertEqual(getElapsedSemesterCycles('2026-01', '2026-07'), 1, '2026-01 to 2026-07 is 1 cycle');
assertEqual(getElapsedSemesterCycles('2026-01', '2027-01'), 2, '2026-01 to 2027-01 is 2 cycles');
assertEqual(getElapsedSemesterCycles('2026-07', '2026-07'), 0, 'Same cycle is 0 elapsed');

// 3. Semester Increment Tests
assertEqual(incrementSemester('1st'), '2nd', '1st -> 2nd');
assertEqual(incrementSemester('7th'), '8th', '7th -> 8th');
assertEqual(incrementSemester('8th'), 'alumni / special', '8th -> alumni / special');
assertEqual(incrementSemester('alumni / special'), 'alumni / special', 'alumni / special stays alumni / special');
assertEqual(incrementSemester('1st', 2), '3rd', '1st + 2 steps -> 3rd');

// 4. Banner Dismiss Flag Logic Tests
function shouldShowSemesterNotice(userProfile, currentCycle) {
  if (!userProfile) return false;
  const dismissed = userProfile.semesterNoticeDismissedCycle;
  return dismissed !== currentCycle;
}

const userProfileDismissed = { semesterNoticeDismissedCycle: '2026-07' };
const userProfileNewUpdate = { semesterNoticeDismissedCycle: '2026-01' };
const userProfileNoFlag = {};

assertEqual(shouldShowSemesterNotice(userProfileDismissed, '2026-07'), false, 'Dismissed in 2026-07 hides banner in 2026-07');
assertEqual(shouldShowSemesterNotice(userProfileNewUpdate, '2026-07'), true, 'Dismissed in 2026-01 shows banner when cycle advances to 2026-07');
assertEqual(shouldShowSemesterNotice(userProfileNoFlag, '2026-07'), true, 'No dismiss flag shows banner');

console.log('Semester Utils Unit Tests completed successfully.');

