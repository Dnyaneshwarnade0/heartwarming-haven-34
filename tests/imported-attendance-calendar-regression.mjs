import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../public/app/enhance.js', import.meta.url), 'utf8');
assert.match(source, /historicalAttendance/);
assert.match(source, /const sPct/, 'imported attendance totals must remain available in the calendar statistics');
assert.doesNotMatch(source, /Imported totals/, 'English imported-total-attendance note must not be displayed');
assert.doesNotMatch(source, /आयात केलेली एकूण हजेरी/, 'Marathi imported-total-attendance note must not be displayed');
console.log('Imported-attendance calendar checks passed.');
