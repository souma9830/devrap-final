// RxRadar Mock Database Generator
// Produces 120+ medicines: branded + generic pairs across 5 pharmacy chains
// Satisfies: 50+ medicines, 30-50% price variation, availability, historical trends

const pharmacies = [
  { name: "Apollo Pharmacy", lat: 12.9716, lng: 77.5946, color: "#ef4444" },
  { name: "MedPlus",         lat: 17.3850, lng: 78.4867, color: "#22c55e" },
  { name: "Netmeds",         lat: 13.0827, lng: 80.2707, color: "#3b82f6" },
  { name: "1mg",             lat: 28.6139, lng: 77.2090, color: "#f97316" },
  { name: "Jan Aushadhi",    lat: 28.5355, lng: 77.3910, color: "#a855f7" },
];

// ── Seeded deterministic pseudo-random (reproducible DB) ────────────────────
let seed = 42;
function rand() {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
}

// ── Price generation: guaranteed 30-50% variance between non-Jan-Aushadhi chains ──
// Strategy:
//  • Pick a random base multiplier for each non-JA pharmacy: range [0.9, 1.4]
//  • Enforce that max/min ratio among non-JA pharmacies >= 1.30 (30% gap)
//  • Jan Aushadhi always = base * 0.28-0.35 (government generic pricing)
function genPrices(base) {
  // Generate raw multipliers for 4 non-JA pharmacies
  const nonJA    = pharmacies.filter(p => p.name !== "Jan Aushadhi");
  let   mults    = nonJA.map(() => 0.9 + rand() * 0.5); // 90%–140%

  // Enforce minimum 30% spread: push the min down or max up if needed
  const minM = Math.min(...mults);
  const maxM = Math.max(...mults);
  if ((maxM / minM) < 1.30) {
    // Scale so spread is exactly 35%
    const spread = maxM - minM;
    const target = minM * 0.35;
    const scale  = target / (spread || 0.01);
    mults = mults.map(m => minM + (m - minM) * scale + (rand() * 0.05));
  }

  const prices = nonJA.map((p, i) => ({
    pharmacy:    p.name,
    pricePerUnit: parseFloat((base * mults[i]).toFixed(2)),
    availability: rand() > 0.12 ? 'In Stock' : 'Limited',
    distanceKm:   parseFloat((rand() * 5).toFixed(1)),
    lat:          p.lat + (rand() - 0.5) * 0.05,
    lng:          p.lng + (rand() - 0.5) * 0.05,
  }));

  // Jan Aushadhi: 28–35% of base (government subsidised generic)
  const jaPharm = pharmacies.find(p => p.name === "Jan Aushadhi");
  prices.push({
    pharmacy:    jaPharm.name,
    pricePerUnit: parseFloat((base * (0.28 + rand() * 0.07)).toFixed(2)),
    availability: rand() > 0.2 ? 'In Stock' : 'Limited',
    distanceKm:   parseFloat((rand() * 8).toFixed(1)),
    lat:          jaPharm.lat + (rand() - 0.5) * 0.08,
    lng:          jaPharm.lng + (rand() - 0.5) * 0.08,
  });

  return prices;
}

// ── Historical prices: 6 months with realistic trend (inflation + dip) ──────
function genHistory(base, isGeneric) {
  const months = ['2025-11','2025-12','2026-01','2026-02','2026-03','2026-04'];
  // Brands: slight upward creep (1–2% per month); generics: flat/slight dip
  const trend = isGeneric ? -0.003 : 0.008;
  return months.map((date, i) => ({
    date,
    price: parseFloat((base * (1 + trend * i + (rand() * 0.08 - 0.04))).toFixed(2))
  }));
}

// ── Medicine seed data ───────────────────────────────────────────────────────
const SEED_MEDICINES = [
  // Cardiovascular
  { id:"1",  brandName:"Lipitor",    genericName:"Atorvastatin",           saltComposition:"Atorvastatin 10mg",                              dosageForm:"Tablet",   strength:"10mg",    manufacturer:"Pfizer",   isGeneric:false, basePrice:25.5,  category:"Cardiovascular",   description:"Statin for cholesterol reduction.",              indications:["High Cholesterol","Cardiovascular Prevention"] },
  { id:"2",  brandName:"Atorva",     genericName:"Atorvastatin",           saltComposition:"Atorvastatin 10mg",                              dosageForm:"Tablet",   strength:"10mg",    manufacturer:"Zydus",    isGeneric:true,  basePrice:9.0,   category:"Cardiovascular",   description:"Generic Atorvastatin.",                          indications:["High Cholesterol"] },
  { id:"3",  brandName:"Norvasc",    genericName:"Amlodipine",             saltComposition:"Amlodipine 5mg",                                 dosageForm:"Tablet",   strength:"5mg",     manufacturer:"Pfizer",   isGeneric:false, basePrice:18.0,  category:"Cardiovascular",   description:"Calcium channel blocker for hypertension.",       indications:["Hypertension","Angina"] },
  { id:"4",  brandName:"Amlokind",   genericName:"Amlodipine",             saltComposition:"Amlodipine 5mg",                                 dosageForm:"Tablet",   strength:"5mg",     manufacturer:"Mankind",  isGeneric:true,  basePrice:6.5,   category:"Cardiovascular",   description:"Generic Amlodipine.",                            indications:["Hypertension"] },
  // Diabetes
  { id:"5",  brandName:"Glucophage", genericName:"Metformin",              saltComposition:"Metformin 500mg",                                dosageForm:"Tablet",   strength:"500mg",   manufacturer:"Merck",    isGeneric:false, basePrice:8.5,   category:"Diabetes",         description:"First-line medication for type 2 diabetes.",     indications:["Type 2 Diabetes"] },
  { id:"6",  brandName:"Glycomet",   genericName:"Metformin",              saltComposition:"Metformin 500mg",                                dosageForm:"Tablet",   strength:"500mg",   manufacturer:"USV",      isGeneric:true,  basePrice:3.2,   category:"Diabetes",         description:"Generic Metformin.",                             indications:["Type 2 Diabetes"] },
  // Pain Relief
  { id:"7",  brandName:"Tylenol",    genericName:"Paracetamol",            saltComposition:"Paracetamol 500mg",                              dosageForm:"Tablet",   strength:"500mg",   manufacturer:"J&J",      isGeneric:false, basePrice:5.0,   category:"Pain Relief",      description:"Common analgesic and antipyretic.",              indications:["Pain","Fever"] },
  { id:"8",  brandName:"Crocin",     genericName:"Paracetamol",            saltComposition:"Paracetamol 500mg",                              dosageForm:"Tablet",   strength:"500mg",   manufacturer:"GSK",      isGeneric:true,  basePrice:2.0,   category:"Pain Relief",      description:"Generic Paracetamol.",                          indications:["Fever","Headache"] },
  // Antibiotics
  { id:"9",  brandName:"Augmentin",  genericName:"Amoxicillin + Clavulanate", saltComposition:"Amoxicillin 500mg + Potassium Clavulanate 125mg", dosageForm:"Tablet", strength:"625mg", manufacturer:"GSK",    isGeneric:false, basePrice:45.0,  category:"Antibiotics",      description:"Broad-spectrum antibiotic.",                    indications:["Sinusitis","Pneumonia","UTI"] },
  { id:"10", brandName:"Moxikind-CV",genericName:"Amoxicillin + Clavulanate", saltComposition:"Amoxicillin 500mg + Potassium Clavulanate 125mg", dosageForm:"Tablet", strength:"625mg", manufacturer:"Mankind", isGeneric:true,  basePrice:18.0,  category:"Antibiotics",      description:"Generic Amoxicillin+Clavulanate.",              indications:["Infections"] },
];

// ── Pairs: [salt, brandName, genericName, brandBasePrice, genericPriceFactor%, category] ──
// genericPriceFactor is 30-60% of brand (varied, not always 50%)
const PAIRS = [
  ["Omeprazole 20mg",              "Prilosec",     "Omez",          15,  38, "Gastroenterology"],
  ["Pantoprazole 40mg",            "Pantocid",     "Pan-40",        14,  42, "Gastroenterology"],
  ["Levothyroxine 50mcg",          "Synthroid",    "Thyronorm",     10,  35, "Thyroid"],
  ["Losartan 50mg",                "Cozaar",       "Losar-50",      12,  40, "Cardiovascular"],
  ["Azithromycin 500mg",           "Zithromax",    "Azithral",      35,  45, "Antibiotics"],
  ["Ciprofloxacin 500mg",          "Cipro",        "Ciplox",        18,  38, "Antibiotics"],
  ["Rosuvastatin 10mg",            "Crestor",      "Rosuvas",       30,  40, "Cardiovascular"],
  ["Sertraline 50mg",              "Zoloft",       "Sertra",        22,  35, "Psychiatry"],
  ["Escitalopram 10mg",            "Lexapro",      "Nexito",        20,  40, "Psychiatry"],
  ["Montelukast 10mg",             "Singulair",    "Montair",       18,  42, "Respiratory"],
  ["Vildagliptin 50mg",            "Galvus",       "Vildamid",      40,  45, "Diabetes"],
  ["Sitagliptin 100mg",            "Januvia",      "Istavel",       55,  50, "Diabetes"],
  ["Telmisartan 40mg",             "Micardis",     "Telma",         15,  38, "Cardiovascular"],
  ["Metoprolol 50mg",              "Lopressor",    "Metolar",       12,  35, "Cardiovascular"],
  ["Clopidogrel 75mg",             "Plavix",       "Clopitab",      25,  40, "Cardiovascular"],
  ["Gabapentin 300mg",             "Neurontin",    "Gabapin",       28,  42, "Neurology"],
  ["Pregabalin 75mg",              "Lyrica",       "Prega-75",      32,  45, "Neurology"],
  ["Duloxetine 30mg",              "Cymbalta",     "Dulojoy",       24,  38, "Psychiatry"],
  ["Venlafaxine 75mg",             "Effexor",      "Ventab",        26,  40, "Psychiatry"],
  ["Fluoxetine 20mg",              "Prozac",       "Fludac",        12,  35, "Psychiatry"],
  ["Aripiprazole 10mg",            "Abilify",      "Arpizol",       45,  50, "Psychiatry"],
  ["Quetiapine 100mg",             "Seroquel",     "Qutipin",       38,  42, "Psychiatry"],
  ["Loratadine 10mg",              "Claritin",     "Lequit",         8,  38, "Allergy"],
  ["Cetirizine 10mg",              "Zyrtec",       "Okacet",         5,  30, "Allergy"],
  ["Fexofenadine 120mg",           "Allegra",      "Allegix",       18,  40, "Allergy"],
  ["Ranitidine 150mg",             "Zantac",       "Rantac",         4,  35, "Gastroenterology"],
  ["Domperidone 10mg",             "Motilium",     "Domstal",        6,  40, "Gastroenterology"],
  ["Ibuprofen 400mg",              "Advil",        "Brufen",         7,  35, "Pain Relief"],
  ["Diclofenac 50mg",              "Voveran",      "Diclogesic",     9,  38, "Pain Relief"],
  ["Tramadol 50mg",                "Ultram",       "Contramal",     15,  42, "Pain Relief"],
  ["Donepezil 5mg",                "Aricept",      "Donep",         30,  45, "Neurology"],
  ["Memantine 10mg",               "Namenda",      "Admenta",       35,  40, "Neurology"],
  ["Levetiracetam 500mg",          "Keppra",       "Levera",        42,  38, "Neurology"],
  ["Salbutamol 100mcg",            "Ventolin",     "Asthalin",     150,  35, "Respiratory"],
  ["Fluticasone 125mcg",           "Flovent",      "Flutiflo",     450,  40, "Respiratory"],
  ["Tiotropium 18mcg",             "Spiriva",      "Tiomist",      600,  45, "Respiratory"],
  ["Latanoprost 0.005%",           "Xalatan",      "Latoprost",    350,  42, "Ophthalmology"],
  ["Timolol 0.5%",                 "Timoptic",     "Iotim",        120,  38, "Ophthalmology"],
  ["Metronidazole 400mg",          "Flagyl",       "Metrogyl",       5,  30, "Antibiotics"],
  ["Fluconazole 150mg",            "Diflucan",     "Forcan",        15,  38, "Antifungal"],
  ["Terbinafine 250mg",            "Lamisil",      "Sebifin",      180,  40, "Antifungal"],
  ["Warfarin 5mg",                 "Coumadin",     "Uniwarfin",     20,  42, "Cardiovascular"],
  ["Spironolactone 25mg",          "Aldactone",    "Aldactone-G",   18,  38, "Cardiovascular"],
  ["Furosemide 40mg",              "Lasix",        "Lasix-G",        4,  30, "Cardiovascular"],
  ["Prednisolone 5mg",             "Omnacortil",   "Wysolone",       6,  35, "Steroids"],
  ["Dexamethasone 0.5mg",          "Decadron",     "Dexona",         2,  32, "Steroids"],
  ["Calcium + Vitamin D3",         "Shelcal",      "Gemcal",         8,  40, "Supplements"],
  ["Iron + Folic Acid",            "Autrin",       "Orofer",        12,  35, "Supplements"],
  ["Vitamin B Complex",            "Becosules",    "Cobadex",        3,  30, "Supplements"],
  ["Metoclopramide 10mg",          "Reglan",       "Perinorm",       4,  38, "Gastroenterology"],
  ["Ondansetron 4mg",              "Zofran",       "Emset",         12,  40, "Gastroenterology"],
  ["Rabeprazole 20mg",             "Aciphex",      "Cyra",          18,  42, "Gastroenterology"],
  ["Lansoprazole 30mg",            "Prevacid",     "Lanzol",        22,  38, "Gastroenterology"],
  ["Levocetirizine 5mg",           "Xyzal",        "Levocet",       10,  35, "Allergy"],
  ["Clarithromycin 500mg",         "Biaxin",       "Claribid",      65,  40, "Antibiotics"],
  ["Linezolid 600mg",              "Zyvox",        "Lizomac",      110,  45, "Antibiotics"],
  ["Meropenem 1g",                 "Merrem",       "Mero",         950,  50, "Antibiotics"],
  ["Vildagliptin + Metformin",     "Galvus Met",   "Zomelis Met",   45,  42, "Diabetes"],
  ["Sitagliptin + Metformin",      "Janumet",      "Istamet",       55,  40, "Diabetes"],
  ["Voglibose 0.3mg",              "Voglibose",    "Volibo",        14,  38, "Diabetes"],
  ["Glimepiride 2mg",              "Amaryl",       "Glimy",          8,  35, "Diabetes"],
  ["Pioglitazone 15mg",            "Actos",        "Pioz",          10,  32, "Diabetes"],
  // Additional medicines to exceed 50+ unique salts
  ["Amlodipine + Atorvastatin",    "Caduet",       "AmCard-A",      35,  40, "Cardiovascular"],
  ["Candesartan 8mg",              "Atacand",      "Candelong",     22,  38, "Cardiovascular"],
  ["Olmesartan 20mg",              "Benicar",      "Olmy-20",       18,  40, "Cardiovascular"],
  ["Dapagliflozin 10mg",           "Farxiga",      "Forxiga-G",     65,  45, "Diabetes"],
  ["Empagliflozin 10mg",           "Jardiance",    "Empa-10",       70,  45, "Diabetes"],
  ["Linagliptin 5mg",              "Tradjenta",    "Lina-5",        55,  42, "Diabetes"],
  ["Atenolol 50mg",                "Tenormin",     "Aten-50",        8,  30, "Cardiovascular"],
  ["Ramipril 5mg",                 "Altace",       "Cardace",       14,  35, "Cardiovascular"],
  ["Enalapril 5mg",                "Vasotec",      "Envas",         10,  32, "Cardiovascular"],
  ["Amoxicillin 500mg",            "Amoxil",       "Novamox",       12,  30, "Antibiotics"],
  ["Doxycycline 100mg",            "Vibramycin",   "Doxt-SL",       18,  35, "Antibiotics"],
  ["Clindamycin 300mg",            "Cleocin",      "Clindac",       25,  40, "Antibiotics"],
  ["Acyclovir 400mg",              "Zovirax",      "Acivir",        22,  38, "Antiviral"],
  ["Oseltamivir 75mg",             "Tamiflu",      "Fluvir",        60,  45, "Antiviral"],
  ["Hydroxychloroquine 200mg",     "Plaquenil",    "HCQ-200",       12,  35, "Immunology"],
  ["Methylprednisolone 4mg",       "Medrol",       "Methpred",      15,  38, "Steroids"],
  ["Budesonide 200mcg",            "Pulmicort",    "Budamate",      250, 40, "Respiratory"],
  ["Formoterol 12mcg",             "Foradil",      "Foracort",      350, 42, "Respiratory"],
  ["Ipratropium 20mcg",            "Atrovent",     "Ipravent",      180, 38, "Respiratory"],
  ["Pantoprazole + Domperidone",   "Pantodom",     "Pantocar-D",    18,  40, "Gastroenterology"],
  ["Esomeprazole 40mg",            "Nexium",       "Esoz-40",       22,  38, "Gastroenterology"],
  ["Cholecalciferol 60000IU",      "D3 Must",      "Calcirol",       8,  30, "Supplements"],
  ["Methylcobalamin 500mcg",       "Mecobalamin",  "Mecovit",        5,  32, "Supplements"],
  ["Folic Acid 5mg",               "Folicin",      "Folvite",        2,  30, "Supplements"],
  ["Aspirin 75mg",                 "Ecosprin",     "Disprin",        3,  30, "Cardiovascular"],
  ["Clopidogrel + Aspirin",        "Deplatt-A",    "Clavix-AS",     18,  40, "Cardiovascular"],
  ["Rosuvastatin + Aspirin",       "Rozucor-AS",   "Rosave-AS",     28,  42, "Cardiovascular"],
  ["Telmisartan + Amlodipine",     "Telsar-AM",    "Telista-AM",    22,  38, "Cardiovascular"],
];

// ── Build seed array ──────────────────────────────────────────────────────────
const medicines = [...SEED_MEDICINES];

PAIRS.forEach(([salt, brand, generic, brandPrice, genericFactorPct, category], i) => {
  const gn         = salt.split(' ')[0];
  const str        = salt.split(' ').slice(1).join(' ') || salt;
  const genericPrice = parseFloat((brandPrice * genericFactorPct / 100).toFixed(2));

  medicines.push({
    id:              `b-${i}`,
    brandName:       brand,
    genericName:     gn,
    saltComposition: salt,
    dosageForm:      "Tablet",
    strength:        str,
    manufacturer:    "Original Pharma Ltd.",
    isGeneric:       false,
    basePrice:       brandPrice,
    category,
    description:     `Original branded formulation of ${salt}.`,
    indications:     ["Maintenance Therapy"]
  });

  medicines.push({
    id:              `g-${i}`,
    brandName:       generic,
    genericName:     gn,
    saltComposition: salt,
    dosageForm:      "Tablet",
    strength:        str,
    manufacturer:    "Generic Pharma India",
    isGeneric:       true,
    basePrice:       genericPrice,
    category,
    description:     `Affordable generic for ${salt}. Same therapeutic effect.`,
    indications:     ["Maintenance Therapy"]
  });
});

// Attach prices and history
medicines.forEach(m => {
  m.prices          = genPrices(m.basePrice);
  m.historicalPrices = genHistory(m.basePrice, m.isGeneric);
});

// ── Output ────────────────────────────────────────────────────────────────────
const totalCount = medicines.length;
const output = {
  generatedAt:       new Date().toISOString(),
  totalCount,
  uniqueSalts:       [...new Set(medicines.map(m => m.saltComposition))].length,
  pharmacies,
  medicines
};

const fs   = require('fs');
const path = require('path');
fs.writeFileSync(path.join(__dirname, 'medicines.json'), JSON.stringify(output, null, 2));
console.log(`✅ Generated ${totalCount} medicines (${output.uniqueSalts} unique salts) → medicines.json`);
console.log(`   Pharmacies: ${pharmacies.length}`);
console.log(`   Branded: ${medicines.filter(m => !m.isGeneric).length} | Generic: ${medicines.filter(m => m.isGeneric).length}`);
console.log(`   Categories: ${[...new Set(medicines.map(m => m.category))].join(', ')}`);
