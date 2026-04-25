const fs = require('fs');
const pdfParse = require('pdf-parse');

const db = JSON.parse(fs.readFileSync('./medicines.json', 'utf-8'));

function matchMedicine(term) {
  if (!term) return null;
  const lt = term.toLowerCase().trim();
  if (lt.length < 2) return null;
  return db.medicines.find(m =>
    m.brandName.toLowerCase().includes(lt) ||
    lt.includes(m.brandName.toLowerCase()) ||
    m.genericName.toLowerCase().includes(lt) ||
    lt.includes(m.genericName.toLowerCase()) ||
    m.saltComposition.toLowerCase().includes(lt)
  ) || null;
}

const DOSAGE_FORMS = ['tablet','capsule','syrup','injection','drops','cream','gel','inhaler','patch','suspension','lotion','spray','ointment'];
const FREQ_MAP = {
  'once a day':1,'once daily':1,'od':1,'qd':1,'daily':1,'once':1,
  'twice a day':2,'twice daily':2,'bd':2,'bid':2,'twice':2,
  'three times a day':3,'three times daily':3,'thrice daily':3,'thrice':3,'tds':3,'tid':3,
  'four times a day':4,'four times daily':4,'qid':4,'qds':4
};

function localParseText(rawText) {
  const text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/[|]{1}/g, 'I')
    .replace(/\b0(?=[a-zA-Z])/g, 'O')
    .trim();

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);
  const parsed = [];

  lines.forEach(line => {
    const ll = line.toLowerCase();
    if (/^(date|patient|doctor|dr\.|rx|name|age|address|diagnosis|clinic|hospital)/i.test(line)) return;
    if (line.length < 4) return;

    const form = DOSAGE_FORMS.find(f => ll.includes(f)) || 'Tablet';
    let frequency = null, freqTimesPerDay = null;
    const freqKeys = Object.keys(FREQ_MAP).sort((a, b) => b.length - a.length);
    for (const key of freqKeys) {
      if (ll.includes(key)) { frequency = key.toUpperCase(); freqTimesPerDay = FREQ_MAP[key]; break; }
    }

    const durMatch = ll.match(/(\d+)\s*(day|days|week|weeks|month|months)/);
    const duration = durMatch ? `${durMatch[1]} ${durMatch[2]}` : null;

    const strMatch = line.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g\b|ml|iu|%)/i);
    const strength = strMatch ? `${strMatch[1]}${strMatch[2].toLowerCase()}` : null;

    let drugName = line;
    if (strMatch) {
      drugName = line.substring(0, strMatch.index);
    } else {
      const markerMatch = ll.match(/\b(tab|cap|syr|tablet|capsule|syrup|twice|thrice|once|daily)\b/i);
      if (markerMatch) drugName = line.substring(0, markerMatch.index);
    }

    drugName = drugName.replace(/[-–(),\/]+$/, '').trim();
    if (!drugName || drugName.length < 2) return;

    const dbMatch = matchMedicine(drugName) || (strength ? matchMedicine(strength) : null);
    
    parsed.push({
      rawLine: line,
      drugName,
      dbMatch: dbMatch ? dbMatch.brandName : null
    });
  });
  return parsed;
}

async function test() {
  try {
    const buffer = fs.readFileSync('D:\\sample_prescription.pdf');
    const data = await pdfParse(buffer);
    console.log("--- RAW TEXT ---");
    console.log(data.text);
    console.log("--- PARSED DRUGS ---");
    console.log(localParseText(data.text));
  } catch(e) {
    console.error(e);
  }
}
test();
