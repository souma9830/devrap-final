/**
 * Mock Medicine Database for RxRadar
 * Contains 50+ medicines with branded/generic variants across multiple pharmacies.
 */

import { Medicine, MedicinePrice } from "./api";

export const pharmacies = ["Apollo Pharmacy", "MedPlus", "Netmeds", "1mg", "Jan Aushadhi"];

export const generateHistoricalPrices = (base: number) => {
  const dates = ['2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04'];
  return dates.map((date, i) => ({
    date,
    price: parseFloat((base * (1 + (Math.random() * 0.2 - 0.1))).toFixed(2)) // +/- 10%
  }));
};

const generatePrices = (base: number): MedicinePrice[] => {
  return pharmacies.map(name => {
    let price = base;
    if (name === "Jan Aushadhi") {
      price = base * 0.3; // Much cheaper generics
    } else {
      price = base * (0.8 + Math.random() * 0.5); // 80% to 130% of base
    }
    
    return {
      pharmacy: name,
      pricePerUnit: parseFloat(price.toFixed(2)),
      availability: Math.random() > 0.1 ? 'In Stock' : 'Limited',
      distanceKm: parseFloat((Math.random() * 5).toFixed(1)),
      monthlyCost: parseFloat((price * 30).toFixed(2)), // Adding required mock field
      pctMoreThanCheapest: 0, // Adding required mock field
      isCheapest: false // Adding required mock field
    };
  });
};

export const medicines: Medicine[] = [
  // Cardiovascular
  {
    id: "1",
    brandName: "Lipitor",
    genericName: "Atorvastatin",
    saltComposition: "Atorvastatin 10mg",
    dosageForm: "Tablet",
    strength: "10mg",
    manufacturer: "Pfizer",
    isGeneric: false,
    basePrice: 25.5,
    prices: [],
    historicalPrices: [],
    description: "Used to lower cholesterol and reduce the risk of heart disease.",
    indications: ["High Cholesterol", "Cardiovascular Prevention"]
  },
  {
    id: "2",
    brandName: "Atorva",
    genericName: "Atorvastatin",
    saltComposition: "Atorvastatin 10mg",
    dosageForm: "Tablet",
    strength: "10mg",
    manufacturer: "Zydus Cadila",
    isGeneric: true,
    basePrice: 12.0,
    prices: [],
    historicalPrices: [],
    description: "Generic atorvastatin for cholesterol management.",
    indications: ["High Cholesterol"]
  },
  {
    id: "3",
    brandName: "Norvasc",
    genericName: "Amlodipine",
    saltComposition: "Amlodipine 5mg",
    dosageForm: "Tablet",
    strength: "5mg",
    manufacturer: "Pfizer",
    isGeneric: false,
    basePrice: 18.0,
    prices: [],
    historicalPrices: [],
    description: "Calcium channel blocker used to treat high blood pressure.",
    indications: ["Hypertension", "Angina"]
  },
  // Diabetes
  {
    id: "4",
    brandName: "Glucophage",
    genericName: "Metformin",
    saltComposition: "Metformin 500mg",
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "Merck",
    isGeneric: false,
    basePrice: 8.5,
    prices: [],
    historicalPrices: [],
    description: "First-line medication for the treatment of type 2 diabetes.",
    indications: ["Type 2 Diabetes"]
  },
  {
    id: "5",
    brandName: "Glycomet",
    genericName: "Metformin",
    saltComposition: "Metformin 500mg",
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "USV",
    isGeneric: true,
    basePrice: 4.2,
    prices: [],
    historicalPrices: [],
    description: "Generic metformin for blood sugar control.",
    indications: ["Type 2 Diabetes"]
  },
  // Pain Relief
  {
    id: "6",
    brandName: "Tylenol",
    genericName: "Paracetamol",
    saltComposition: "Paracetamol 500mg",
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "J&J",
    isGeneric: false,
    basePrice: 5.0,
    prices: [],
    historicalPrices: [],
    description: "Common pain reliever and fever reducer.",
    indications: ["Pain", "Fever"]
  },
  {
    id: "7",
    brandName: "Crocin",
    genericName: "Paracetamol",
    saltComposition: "Paracetamol 500mg",
    dosageForm: "Tablet",
    strength: "500mg",
    manufacturer: "GSK",
    isGeneric: true,
    basePrice: 2.5,
    prices: [],
    historicalPrices: [],
    description: "Effective fever and pain management.",
    indications: ["Fever", "Headache"]
  },
  // Antibiotics
  {
    id: "8",
    brandName: "Augmentin",
    genericName: "Amoxicillin + Clavulanate",
    saltComposition: "Amoxicillin 500mg + Potassium Clavulanate 125mg",
    dosageForm: "Tablet",
    strength: "625mg",
    manufacturer: "GSK",
    isGeneric: false,
    basePrice: 45.0,
    prices: [],
    historicalPrices: [],
    description: "Broad-spectrum antibiotic for bacterial infections.",
    indications: ["Sinusitis", "Pneumonia", "UTI"]
  },
  {
    id: "9",
    brandName: "Moxikind-CV",
    genericName: "Amoxicillin + Clavulanate",
    saltComposition: "Amoxicillin 500mg + Potassium Clavulanate 125mg",
    dosageForm: "Tablet",
    strength: "625mg",
    manufacturer: "Mankind",
    isGeneric: true,
    basePrice: 28.0,
    prices: [],
    historicalPrices: [],
    description: "Effective generic antibiotic combination.",
    indications: ["Infections"]
  }
];

// Fill the database with more medicines to reach 50+
const genericSalts = [
  { salt: "Omeprazole 20mg", brand: "Prilosec", generic: "Omez", price: 15 },
  { salt: "Pantoprazole 40mg", brand: "Pantocid", generic: "Pan-40", price: 14 },
  { salt: "Levothyroxine 50mcg", brand: "Synthroid", generic: "Thyronorm", price: 10 },
  { salt: "Losartan 50mg", brand: "Cozaar", generic: "Losar-50", price: 12 },
  { salt: "Azithromycin 500mg", brand: "Zithromax", generic: "Azithral", price: 35 },
  { salt: "Ciprofloxacin 500mg", brand: "Cipro", generic: "Ciplox", price: 18 },
  { salt: "Rosuvastatin 10mg", brand: "Crestor", generic: "Rosuvas", price: 30 },
  { salt: "Sertraline 50mg", brand: "Zoloft", generic: "Sertra", price: 22 },
  { salt: "Escitalopram 10mg", brand: "Lexapro", generic: "Nexito", price: 20 },
  { salt: "Montelukast 10mg", brand: "Singulair", generic: "Montair", price: 18 },
  { salt: "Vildagliptin 50mg", brand: "Galvus", generic: "Vildamid", price: 40 },
  { salt: "Sitagliptin 100mg", brand: "Januvia", generic: "Istavel", price: 55 },
  { salt: "Telmisartan 40mg", brand: "Micardis", generic: "Telma", price: 15 },
  { salt: "Metoprolol 50mg", brand: "Lopressor", generic: "Metolar", price: 12 },
  { salt: "Clopidogrel 75mg", brand: "Plavix", generic: "Clopitab", price: 25 },
  { salt: "Gabapentin 300mg", brand: "Neurontin", generic: "Gabapin", price: 28 },
  { salt: "Pregabalin 75mg", brand: "Lyrica", generic: "Prega-75", price: 32 },
  { salt: "Duloxetine 30mg", brand: "Cymbalta", generic: "Dulojoy", price: 24 },
  { salt: "Venlafaxine 75mg", brand: "Effexor", generic: "Ventab", price: 26 },
  { salt: "Fluoxetine 20mg", brand: "Prozac", generic: "Fludac", price: 12 },
  { salt: "Aripiprazole 10mg", brand: "Abilify", generic: "Arpizol", price: 45 },
  { salt: "Quetiapine 100mg", brand: "Seroquel", generic: "Qutipin", price: 38 },
  { salt: "Loratadine 10mg", brand: "Claritin", generic: "Lequit", price: 8 },
  { salt: "Cetirizine 10mg", brand: "Zyrtec", generic: "Okacet", price: 5 },
  { salt: "Fexofenadine 120mg", brand: "Allegra", generic: "Allegix", price: 18 },
  { salt: "Ranitidine 150mg", brand: "Zantac", generic: "Rantac", price: 4 },
  { salt: "Domperidone 10mg", brand: "Motilium", generic: "Domstal", price: 6 },
  { salt: "Ibuprofen 400mg", brand: "Advil", generic: "Brufen", price: 7 },
  { salt: "Diclofenac 50mg", brand: "Voveran", generic: "Diclogesic", price: 9 },
  { salt: "Tramadol 50mg", brand: "Ultram", generic: "Contramal", price: 15 },
  { salt: "Donepezil 5mg", brand: "Aricept", generic: "Donep", price: 30 },
  { salt: "Memantine 10mg", brand: "Namenda", generic: "Admenta", price: 35 },
  { salt: "Levetiracetam 500mg", brand: "Keppra", generic: "Levera", price: 42 },
  { salt: "Salbutamol 100mcg", brand: "Ventolin", generic: "Asthalin", price: 150 },
  { salt: "Fluticasone 125mcg", brand: "Flovent", generic: "Flutiflo", price: 450 },
  { salt: "Tiotropium 18mcg", brand: "Spiriva", generic: "Tiomist", price: 600 },
  { salt: "Latanoprost 0.005%", brand: "Xalatan", generic: "Latoprost", price: 350 },
  { salt: "Timolol 0.5%", brand: "Timoptic", generic: "Iotim", price: 120 },
  { salt: "Metronidazole 400mg", brand: "Flagyl", generic: "Metrogyl", price: 5 },
  { salt: "Fluconazole 150mg", brand: "Diflucan", generic: "Forcan", price: 15 },
  { salt: "Terbinafine 250mg", brand: "Lamisil", generic: "Sebifin", price: 180 },
  { salt: "Warfarin 5mg", brand: "Coumadin", generic: "Uniwarfin", price: 20 },
  { salt: "Spironolactone 25mg", brand: "Aldactone", generic: "Aldactone-G", price: 18 },
  { salt: "Furosemide 40mg", brand: "Lasix", generic: "Lasix-G", price: 4 },
  { salt: "Prednisolone 5mg", brand: "Omnacortil", generic: "Wysolone", price: 6 },
  { salt: "Dexamethasone 0.5mg", brand: "Decadron", generic: "Dexona", price: 2 },
  { salt: "Calcium + Vitamin D3", brand: "Shelcal", generic: "Gemcal", price: 8 },
  { salt: "Iron + Folic Acid", brand: "Autrin", generic: "Orofer", price: 12 },
  { salt: "Vitamin B Complex", brand: "Becosules", generic: "Cobadex", price: 3 },
  { salt: "Metoclopramide 10mg", brand: "Reglan", generic: "Perinorm", price: 4 },
  { salt: "Ondansetron 4mg", brand: "Zofran", generic: "Emset", price: 12 },
  { salt: "Rabeprazole 20mg", brand: "Aciphex", generic: "Cyra", price: 18 },
  { salt: "Lansoprazole 30mg", brand: "Prevacid", generic: "Lanzol", price: 22 },
  { salt: "Levocetirizine 5mg", brand: "Xyzal", generic: "Levocet", price: 10 },
  { salt: "Clarithromycin 500mg", brand: "Biaxin", generic: "Claribid", price: 65 },
  { salt: "Linezolid 600mg", brand: "Zyvox", generic: "Lizomac", price: 110 },
  { salt: "Meropenem 1g", brand: "Merrem", generic: "Mero", price: 950 },
  { salt: "Vildagliptin + Metformin", brand: "Galvus Met", generic: "Zomelis Met", price: 45 },
  { salt: "Sitagliptin + Metformin", brand: "Janumet", generic: "Istamet", price: 55 },
  { salt: "Voglibose 0.3mg", brand: "Voglibose", generic: "Volibo", price: 14 },
  { salt: "Glimepiride 2mg", brand: "Amaryl", generic: "Glimy", price: 8 },
  { salt: "Pioglitazone 15mg", brand: "Actos", generic: "Pioz", price: 10 },
];

genericSalts.forEach((m, index) => {
  // Add Branded
  medicines.push({
    id: `b-${index}`,
    brandName: m.brand,
    genericName: m.salt.split(' ')[0],
    saltComposition: m.salt,
    dosageForm: "Tablet",
    strength: m.salt.split(' ').pop() || "",
    manufacturer: "Big Pharma",
    isGeneric: false,
    basePrice: m.price,
    prices: [],
    historicalPrices: [],
    description: `Original brand for ${m.salt}.`,
    indications: ["Maintenance Therapy"]
  });
  // Add Generic
  medicines.push({
    id: `g-${index}`,
    brandName: m.generic,
    genericName: m.salt.split(' ')[0],
    saltComposition: m.salt,
    dosageForm: "Tablet",
    strength: m.salt.split(' ').pop() || "",
    manufacturer: "Generic Life",
    isGeneric: true,
    basePrice: m.price * 0.5,
    prices: [],
    historicalPrices: [],
    description: `High quality generic for ${m.salt}.`,
    indications: ["Maintenance Therapy"]
  });
});

// Final processing
medicines.forEach(m => {
  m.prices = generatePrices(m.basePrice);
  m.historicalPrices = generateHistoricalPrices(m.basePrice);
});
