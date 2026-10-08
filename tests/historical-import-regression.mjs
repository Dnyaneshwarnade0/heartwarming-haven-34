import assert from 'node:assert/strict';
import { parseWorkbook, validateImport, mergeHistoricalData } from '../scripts/import-historical-school-data.mjs';

const workbook = 'C:/Users/Admin/Pictures/update 1.xlsx';
const payload = await parseWorkbook(workbook);

assert.equal(payload.monthlyTotals.length, 72, 'imports each roll number once');
assert.equal(payload.notGoingRolls.length, 15, 'uses the red student names as the school-exempt list');
assert.equal(payload.complaints.length, 74, 'retains every complaint record');

const atharv = payload.monthlyTotals.find((row) => row.rollNo === 37);
assert.deepEqual(atharv.months['2026-09'], { school: 19, evening: 26, morning: 26 }, 'uses Atharv’s approved correction');
const vedant = payload.monthlyTotals.find((row) => row.rollNo === 17);
assert.equal(vedant.months['2026-09'].school, null, 'keeps Vedant’s blank school total unavailable');
const yash = payload.monthlyTotals.find((row) => row.rollNo === 22);
assert.equal(yash.months['2026-06'].morning, null, 'keeps Yash’s blank morning total unavailable');
assert.equal(yash.months['2026-06'].evening, null, 'keeps Yash’s blank evening total unavailable');

assert.deepEqual(validateImport([{ rollNo: 1 }, { rollNo: 2 }], { monthlyTotals: [{ rollNo: 1 }], notGoingRolls: [], complaints: [] }), { ok: false, reason: 'missing workbook roll 2' }, 'does not allow a partial roster import');
const merged = mergeHistoricalData([{ rollNo: 1, complaints: [{ date: '2026-06-01', type: 'Late', severity: 'low', action: 'Note' }] }], {
  monthlyTotals: [{ rollNo: 1, months: {} }], notGoingRolls: [], complaints: [{ rollNo: 1, date: '2026-06-01', type: 'Late', severity: 'low', action: 'Note', blacklist: false }],
});
assert.equal(merged[0].complaints.length, 1, 'does not duplicate imported complaints when re-run');
const generated = mergeHistoricalData([{ rollNo: 9, complaints: [] }], {
  monthlyTotals: [{ rollNo: 9, months: { '2026-06': { school: 2, evening: 1, morning: 2 } } }], notGoingRolls: [], complaints: [],
});
const june = Object.entries(generated[0].dailyAttendance).filter(([date]) => date.startsWith('2026-06'));
assert.equal(june.filter(([, rec]) => rec.school === true).length, 2, 'creates school present records from the monthly total');
assert.equal(june.filter(([, rec]) => rec.school === false).length > 0, true, 'marks the remaining working days absent');
assert.equal(june.some(([date]) => new Date(`${date}T00:00:00Z`).getUTCDay() === 0), false, 'never creates Sunday attendance');
const exempt = mergeHistoricalData([{ rollNo: 10, complaints: [] }], {
  monthlyTotals: [{ rollNo: 10, months: { '2026-06': { school: 2, evening: 1, morning: 2 } } }], notGoingRolls: [10], complaints: [],
});
assert.equal(Object.values(exempt[0].dailyAttendance).some((rec) => Object.hasOwn(rec, 'school')), false, 'never marks school-exempt students absent or present for school');

console.log('Historical import regression checks passed.');
