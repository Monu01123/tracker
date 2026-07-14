import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateXP, getMondayStartISO } from '../services/xpService.js';

describe('XP Service Formulas', () => {
  it('correctly calculates XP: 10 per Easy, 20 per Medium, 30 per Hard', () => {
    assert.strictEqual(calculateXP(1, 0, 0), 10);
    assert.strictEqual(calculateXP(0, 1, 0), 20);
    assert.strictEqual(calculateXP(0, 0, 1), 30);
    assert.strictEqual(calculateXP(5, 3, 2), 5 * 10 + 3 * 20 + 2 * 30);
  });

  it('calculates Monday start timestamp accurately for different days of week', () => {
    // Wednesday July 16, 2026
    const wed = new Date(2026, 6, 16, 14, 0, 0); // Month is 0-indexed (6 is July)
    const mondayStr = getMondayStartISO(wed);
    const mondayLocal = new Date(mondayStr);
    assert.strictEqual(mondayLocal.getDay(), 1); // Must be Monday (1)
    assert.strictEqual(mondayLocal.getHours(), 0);
    assert.strictEqual(mondayLocal.getDate(), 13); // July 13 is Monday

    // Sunday July 19, 2026
    const sun = new Date(2026, 6, 19, 23, 0, 0);
    const mondaySunStr = getMondayStartISO(sun);
    const mondaySunLocal = new Date(mondaySunStr);
    assert.strictEqual(mondaySunLocal.getDay(), 1);
    assert.strictEqual(mondaySunLocal.getDate(), 13);
  });
});
