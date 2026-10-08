import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';

const base = 'https://darkred-squid-510856.hostingersite.com/wp-content/uploads/2026/07/';
export const photoByRoll = {
  1: base + 'अवधूत-महाराज-सूर्यवंशी-rotated.jpg', 5: base + 'शाम-महाराज-शिंगारे-rotated.jpg',
  7: base + 'कार्तिक-महाराज-कानभुलकर-rotated.jpg', 10: base + 'तन्मय-महाराज-सावंत-rotated.jpg',
  12: base + 'अक्षय-महाराज-ठोकर-rotated.jpg', 14: base + 'संकेत-महाराज-मासोळे-rotated.jpg',
  16: base + 'ईश्वर-महाराज-रहाणे-rotated.jpg', 17: base + 'वेदांत-महाराज-उंबरे-rotated.jpg',
  19: base + 'ओमकार-महाराज-गवळी-rotated.jpg', 22: base + 'यश-महाराज-शिंदे-rotated.jpg',
  23: base + 'भावेश-महाराज-जोगदंड-rotated.jpg', 24: base + 'राम-महाराज-शिंगारे-rotated.jpg',
  25: base + 'पार्थ-महाराज-मोरे-rotated.jpg', 26: base + 'आर्यन-महाराज-उगले-rotated.jpg',
  28: base + 'विनायक-महाराज-चुगरावाल-rotated.jpg', 30: base + 'वैभव-महाराज-काळे-rotated.jpg',
  35: base + 'वेदांत-महाराज-गव्हाणे-rotated.jpg', 36: base + 'संदीप-महाराज-वाघमारे-rotated.jpg',
  37: base + 'अथर्व-महाराज-वाघमारे-rotated.jpg', 40: base + 'सिद्धेश्वर-महाराज-वाघमारे-rotated.jpg',
  41: base + 'दयानंद-महाराज-जाधव-rotated.jpg', 42: base + 'संतोष-महाराज-सदार-rotated.jpg',
  45: base + 'अविनाश-महाराज-पवार-rotated.jpg', 49: base + 'सार्थक-महाराज-सूर्यवंशी-rotated.jpg',
  50: base + 'गंगाधर-महाराज-पांचाळ-rotated.jpg', 51: base + 'ज्ञानेश्वर-महाराज-पांचाळ-rotated.jpg',
  52: base + 'आयुष-महाराज-भंडारे-rotated.jpg', 53: base + 'सिद्धार्थ-महाराज-कदम-rotated.jpg',
  54: base + 'अनुकल्प-महाराज-येवले-rotated.jpg', 57: base + 'हरीओम-महाराज-कानभुलकर-rotated.jpg',
  59: base + 'भावेश-महाराज-खडसे-rotated.jpg', 61: base + 'शहाजी-महाराज-जाधव-rotated.jpg',
  70: base + 'कार्तिक-महाराज-बाजड-rotated.jpg', 71: base + 'सागर-महाराज-अंभोरे-rotated.jpg'
};

export function mergePhotos(students) {
  return students.map((student) => photoByRoll[student.rollNo] ? { ...student, photo: photoByRoll[student.rollNo] } : student);
}

if (process.argv[1]?.endsWith('import-student-photos.mjs') && process.argv[2]) {
  const target = process.argv[2];
  const source = await readFile(target, 'utf8');
  const match = source.match(/window\.VSS_STATE_SEED\s*=\s*(\{[\s\S]*\});\s*$/);
  if (!match) throw new Error('Unable to locate VSS_STATE_SEED.');
  const state = JSON.parse(match[1]);
  await mkdir('work', { recursive: true });
  await copyFile(target, 'work/state-seed.before-photo-import.js');
  state.vss_students = JSON.stringify(mergePhotos(JSON.parse(state.vss_students)));
  await writeFile(target, `window.VSS_STATE_SEED = ${JSON.stringify(state)};\n`);
  console.log(`Student photos imported: ${Object.keys(photoByRoll).length}.`);
}
