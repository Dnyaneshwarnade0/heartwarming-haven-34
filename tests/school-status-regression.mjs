import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../public/app/school-status.js', import.meta.url), 'utf8');
const context = { window: {}, document: { readyState: 'loading', addEventListener() {} }, setTimeout() {}, localStorage: { getItem() { return null; }, setItem() {} } };
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(source, context);

assert.equal(context.window.vssIsSchoolEligible({ notGoingToSchool: true }), false);
assert.equal(context.window.vssIsSchoolEligible({ notGoingToSchool: false }), true);
console.log('School-status eligibility checks passed.');
