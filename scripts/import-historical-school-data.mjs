import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';

const run = promisify(execFile);
const python = 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';

const extractor = String.raw`
import json, sys
from openpyxl import load_workbook
w = load_workbook(sys.argv[1], data_only=True)
attendance = w['Student Roll List']
months = [('2026-06', 4, 9, 14), ('2026-07', 5, 10, 15), ('2026-08', 6, 11, 16), ('2026-09', 7, 12, 17)]
rows = []
for r in range(5, 77):
    roll = attendance.cell(r, 1).value
    if not isinstance(roll, (int, float)): continue
    record = {'rollNo': int(roll), 'months': {}}
    for key, school, evening, morning in months:
        record['months'][key] = {'school': attendance.cell(r, school).value, 'evening': attendance.cell(r, evening).value, 'morning': attendance.cell(r, morning).value}
    rows.append(record)
status = w['Student not going to school']
not_going = []
for r in range(5, status.max_row + 1):
    roll = status.cell(r, 1).value
    name = status.cell(r, 3)
    if isinstance(roll, (int, float)) and name.font.color and name.font.color.type == 'rgb' and name.font.color.rgb == 'FFFF0000': not_going.append(int(roll))
complaints = []
sheet = w['Complaints Log']
for r in range(2, sheet.max_row + 1):
    roll = sheet.cell(r, 1).value
    if isinstance(roll, (int, float)):
        complaints.append({'rollNo': int(roll), 'date': sheet.cell(r,5).value.isoformat()[:10], 'type': sheet.cell(r,6).value, 'severity': sheet.cell(r,7).value, 'action': sheet.cell(r,8).value, 'blacklist': sheet.cell(r,9).value == 'Blacklist'})
print(json.dumps({'monthlyTotals': rows, 'notGoingRolls': not_going, 'complaints': complaints,}, ensure_ascii=True, default=str))
`;

export async function parseWorkbook(path) {
  const { stdout } = await run(python, ['-c', extractor, path], { encoding: 'utf8' });
  const payload = JSON.parse(stdout);
  const atharv = payload.monthlyTotals.find((row) => row.rollNo === 37);
  atharv.months['2026-09'].evening = 26;
  atharv.months['2026-09'].morning = 26;
  payload.monthlyTotals.find((row) => row.rollNo === 17).months['2026-09'].school = null;
  const yash = payload.monthlyTotals.find((row) => row.rollNo === 22);
  yash.months['2026-06'].morning = null;
  yash.months['2026-06'].evening = null;
  return payload;
}

export function validateImport(students, payload) {
  const rolls = new Set(payload.monthlyTotals.map((row) => row.rollNo));
  if (rolls.size !== payload.monthlyTotals.length) return { ok: false, reason: 'duplicate workbook roll number' };
  for (const student of students) if (!rolls.has(student.rollNo)) return { ok: false, reason: `missing workbook roll ${student.rollNo}` };
  return { ok: true };
}

export function workingDates(month, holidays = {}) {
  const [year, mon] = month.split('-').map(Number);
  const days = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  const dates = [];
  for (let day = 1; day <= days; day++) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    if (new Date(`${date}T00:00:00Z`).getUTCDay() !== 0 && !holidays[date]) dates.push(date);
  }
  return dates;
}

function dailyAttendanceFromTotals(months, schoolExempt, holidays) {
  const daily = {};
  for (const [month, totals] of Object.entries(months || {})) {
    const dates = workingDates(month, holidays);
    for (const session of ['morning', 'evening', 'school']) {
      if (session === 'school' && schoolExempt) continue;
      const total = totals?.[session];
      if (total == null || total === '') continue;
      const presentDays = Math.max(0, Math.min(Number(total) || 0, dates.length));
      dates.forEach((date, index) => {
        daily[date] = daily[date] || {};
        daily[date][session] = index < presentDays;
      });
    }
  }
  return daily;
}

export function mergeHistoricalData(students, payload, holidays = {}) {
  const byRoll = new Map(payload.monthlyTotals.map((row) => [row.rollNo, row]));
  return students.map((student) => {
    const source = byRoll.get(student.rollNo);
    const importedComplaints = payload.complaints.filter((item) => item.rollNo === student.rollNo)
      .map(({ blacklist, rollNo, ...item }) => item);
    const complaintKey = (item) => [item.date || '', item.type || '', item.severity || '', item.action || ''].join('|');
    const complaints = [...(student.complaints || []), ...importedComplaints]
      .filter((item, index, all) => all.findIndex((other) => complaintKey(other) === complaintKey(item)) === index);
    const blacklisted = payload.complaints.some((item) => item.rollNo === student.rollNo && item.blacklist);
    const notGoingToSchool = payload.notGoingRolls.includes(student.rollNo);
    const importedDaily = dailyAttendanceFromTotals(source.months, notGoingToSchool, holidays);
    const dailyAttendance = { ...(student.dailyAttendance || {}) };
    for (const [date, sessions] of Object.entries(importedDaily)) {
      dailyAttendance[date] = { ...sessions, ...(dailyAttendance[date] || {}) };
    }
    if (notGoingToSchool) {
      Object.values(dailyAttendance).forEach((sessions) => { delete sessions.school; });
    }
    return { ...student, historicalAttendance: source.months, notGoingToSchool, dailyAttendance, complaints, ...(blacklisted ? { blacklisted: true } : {}) };
  });
}

if (process.argv[1]?.endsWith('import-historical-school-data.mjs') && process.argv[2]) {
  const target = process.argv[2];
  const source = await readFile(target, 'utf8');
  const match = source.match(/window\.VSS_STATE_SEED\s*=\s*(\{[\s\S]*\});\s*$/);
  if (!match) throw new Error('Unable to locate VSS_STATE_SEED.');
  const state = JSON.parse(match[1]);
  const students = JSON.parse(state.vss_students);
  const payload = await parseWorkbook('C:/Users/Admin/Pictures/update 1.xlsx');
  const validation = validateImport(students, payload);
  if (!validation.ok) throw new Error(validation.reason);
  await mkdir('work', { recursive: true });
  await copyFile(target, 'work/state-seed.before-historical-import.js');
  const holidays = JSON.parse(state.vss_holidays || '{}');
  state.vss_students = JSON.stringify(mergeHistoricalData(students, payload, holidays));
  await writeFile(target, `window.VSS_STATE_SEED = ${JSON.stringify(state)};\n`);
  console.log('Historical data imported.');
}
