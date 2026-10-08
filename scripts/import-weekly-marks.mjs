import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const [statePath, workbookPath] = process.argv.slice(2);
if (!statePath || !workbookPath) {
  throw new Error('Usage: node scripts/import-weekly-marks.mjs <state-seed.js> <update 1.xlsx>');
}

const ps = String.raw`
Add-Type -AssemblyName System.IO.Compression.FileSystem
$workbookPath = '${workbookPath.replace(/'/g, "''")}'
$zip=[System.IO.Compression.ZipFile]::OpenRead($workbookPath)
function Read-ZipText($name) { $entry=$zip.GetEntry($name); $reader=[IO.StreamReader]::new($entry.Open()); $text=$reader.ReadToEnd(); $reader.Close(); return $text }
[xml]$sharedXml=Read-ZipText 'xl/sharedStrings.xml'
$ns=[System.Xml.XmlNamespaceManager]::new($sharedXml.NameTable)
$ns.AddNamespace('x','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
$shared=@($sharedXml.SelectNodes('//x:si',$ns) | ForEach-Object { $_.InnerText })
[xml]$sheetXml=Read-ZipText 'xl/worksheets/sheet3.xml'
$rows=@()
foreach($row in $sheetXml.SelectNodes('//x:sheetData/x:row',$ns)) {
  if([int]$row.r -lt 2) { continue }
  $cells=@{}
  foreach($cell in $row.SelectNodes('x:c',$ns)) {
    $col=($cell.r -replace '\d','')
    $value=$cell.v
    if($cell.t -eq 's') { $value=$shared[[int]$value] }
    $cells[$col]=$value
  }
  if(!$cells.ContainsKey('A') -or [string]$cells['A'] -notmatch '^\d+(?:\.0+)?$') { continue }
  $marks=@()
  foreach($col in @('E','F','G','H','I','J','K','L','M','N')) {
    $value=[string]$cells[$col]
    if([string]::IsNullOrWhiteSpace($value) -or $value -eq '-' -or $value -notmatch '^\d+(?:\.\d+)?$') { $marks += $null } else { $marks += [int][double]$value }
  }
  $rows += [pscustomobject]@{ roll=[int][double]$cells['A']; marks=$marks }
}
$zip.Dispose()
$rows | ConvertTo-Json -Depth 4 -Compress
`;

const rows = JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], { encoding: 'utf8' }));
if (!Array.isArray(rows) || rows.length !== 72 || new Set(rows.map((row) => row.roll)).size !== 72) {
  throw new Error('Marks worksheet must contain exactly 72 unique student rolls.');
}
if (rows.some((row) => !Array.isArray(row.marks) || row.marks.length !== 10)) {
  throw new Error('Marks worksheet must contain Week 1 through Week 10.');
}

const stateCode = await readFile(statePath, 'utf8');
const stateContext = { window: {} };
vm.runInNewContext(stateCode, stateContext);
const state = stateContext.window.VSS_STATE_SEED;
const students = JSON.parse(state.vss_students);
const byRoll = new Map(students.map((student) => [Number(student.rollNo), student]));
if (byRoll.size !== 72 || rows.some((row) => !byRoll.has(row.roll))) {
  throw new Error('Workbook rolls do not match the seeded student roster.');
}

const marksByRoll = Object.fromEntries(rows.map((row) => [String(row.roll), row.marks]));
const exams = JSON.parse(state.vss_exams);
const importedWeeks = rows[0].marks.map((_, index) => {
  const week = index + 1;
  const entries = {};
  rows.forEach((row) => {
    const mark = row.marks[index];
    if (mark === null) return;
    entries[byRoll.get(row.roll).id] = { marks: mark, remark: '' };
  });
  return {
    id: `wk-${week}`,
    kind: 'weekly',
    name: `साप्ताहिक परीक्षा ${week}`,
    subject: '',
    date: new Date(Date.UTC(2026, 6, 20 + (week - 1) * 7)).toISOString().slice(0, 10),
    max: 100,
    savedAt: '2026-10-04T00:00:00.000Z',
    entries,
  };
});
state.vss_exams = JSON.stringify([
  ...exams.filter((exam) => !/^wk-(?:[1-9]|10)$/.test(String(exam.id || ''))),
  ...importedWeeks,
]);

await writeFile('public/app/weekly-marks-data.js', `/* auto-generated from Marks sheet (Week 1-10) */\nwindow.VSS_WEEKLY_MARKS = ${JSON.stringify(marksByRoll, null, 2)};\n`);
await writeFile(statePath, `window.VSS_STATE_SEED = ${JSON.stringify(state)};\n`);
console.log(`Imported Week 1-10 marks for ${rows.length} students.`);
