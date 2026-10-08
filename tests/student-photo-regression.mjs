import assert from 'node:assert/strict';
import { photoByRoll } from '../scripts/import-student-photos.mjs';

assert.match(photoByRoll[37], /अथर्व-महाराज-वाघमारे/);
assert.match(photoByRoll[17], /वेदांत-महाराज-उंबरे/);
assert.equal(Object.keys(photoByRoll).length, 34);
console.log('Student photo mapping checks passed.');
