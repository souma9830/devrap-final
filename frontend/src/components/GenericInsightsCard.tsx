import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pill, ArrowRight, ShieldCheck, TrendingDown, AlertCircle,
  ChevronDown, ChevronUp, CheckCircle2, Beaker, Copy, Info
} from 'lucide-react';
import { AnalysisResult } from '../lib/api';
import { formatCurrency } from '../lib/utils';

interface GenericInsightsCardProps {
  results: AnalysisResult[];
}

// Parse "Amoxicillin 500mg + Potassium Clavulanate 125mg" → [{name, strength}]
function parseSalt(composition: string): { name: string; strength: string }[] {
  return composition.split(/\s*\+\s*/).map(part => {
    const match = part.trim().match(/^(.+?)\s+([\d.]+\s*(?:mg|mcg|g|ml|iu|%))$/i);
    if (match) return { name: match[1].trim(), strength: match[2].trim() };
    return { name: part.trim(), strength: '' };
  });
}

// Savings delta sentence
function savingsDelta(monthly: number, annual: number, pct: number): string {
  return `Switching saves ${formatCurrency(monthly)}/month = ${formatCurrency(annual)}/year (${pct}% cheaper)`;
}

const SAFETY_LEVELS = [
  { label: 'Therapeutically Equivalent', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
];

export default function GenericInsightsCard({ results }: GenericInsightsCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(results[0]?.medicine.id ?? null);
  const [copied, setCopied] = useState<string | null>(null);

  const withGeneric    = results.filter(r => r.generic);
  const withoutGeneric = results.filter(r => !r.generic);

  const totalMonthlySaving = withGeneric.reduce((s, r) => s + (r.generic?.monthlySavings ?? 0), 0);
  const totalAnnualSaving  = parseFloat((totalMonthlySaving * 12).toFixed(2));

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Beaker className="w-4 h-4 text-emerald-300" />
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                Generic & Substitution Insights
              </p>
            </div>
            <h2 className="text-xl font-black text-white">Salt Composition Analysis</h2>
            <p className="text-emerald-200 text-xs mt-1">
              {withGeneric.length} of {results.length} medicines have cheaper generic alternatives
            </p>
          </div>

          {/* Total savings hero */}
          {totalMonthlySaving > 0 && (
            <div className="text-right shrink-0 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Total Switch Saving</p>
              <p className="text-2xl font-black text-white">{formatCurrency(totalMonthlySaving)}<span className="text-sm font-normal text-emerald-300">/mo</span></p>
              <p className="text-emerald-300 text-[11px] font-bold mt-0.5">{formatCurrency(totalAnnualSaving)} / year</p>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {/* ── Medicines WITH generics ─────────────────────────────────────── */}
        {withGeneric.map((result) => {
          const { medicine, generic, dosesPerDay, currentInfo } = result;
          const isOpen    = expandedId === medicine.id;
          const saltParts = parseSalt(medicine.saltComposition);
          const monthly   = generic!.monthlySavings;
          const annual    = parseFloat((monthly * 12).toFixed(2));
          const pct       = generic!.savingsPercent;
          const delta     = savingsDelta(monthly, annual, pct);
          const script    = `Do you have ${medicine.genericName} — generic for ${medicine.brandName} (${medicine.saltComposition})?`;

          return (
            <div key={medicine.id}>
              {/* Row header — always visible */}
              <button
                onClick={() => setExpandedId(isOpen ? null : medicine.id)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <Pill className="w-4.5 h-4.5 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-slate-900">{medicine.brandName}</p>
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">{medicine.category}</span>
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Generic available</span>
                    </div>
                    {/* Savings delta — the key line */}
                    <p className="text-[11px] font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 shrink-0" />
                      {delta}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key={`detail-${medicine.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-5">

                      {/* Salt composition breakdown */}
                      <div className="bg-slate-900 rounded-xl p-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Salt Composition — {medicine.brandName}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {saltParts.map((part, i) => (
                            <React.Fragment key={i}>
                              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                                <p className="text-white text-xs font-bold">{part.name}</p>
                                {part.strength && (
                                  <p className="text-emerald-400 text-[10px] font-black mt-0.5">{part.strength}</p>
                                )}
                              </div>
                              {i < saltParts.length - 1 && (
                                <div className="flex items-center text-slate-500 text-sm font-bold">+</div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-3 font-mono">{medicine.saltComposition}</p>
                      </div>

                      {/* Brand vs Generic comparison */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Current brand */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Brand</p>
                          <p className="text-base font-black text-slate-900">{medicine.brandName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{medicine.manufacturer}</p>
                          <div className="mt-3 space-y-1.5">
                            <Row label="Unit price"   value={formatCurrency(currentInfo.price)} />
                            <Row label="Monthly cost" value={formatCurrency(currentInfo.monthlyCost)} highlight />
                            <Row label="Annual cost"  value={formatCurrency(currentInfo.monthlyCost * 12)} />
                            <Row label="Doses/day"    value={`${dosesPerDay}×`} />
                          </div>
                        </div>

                        {/* Generic recommendation */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 relative">
                          <div className="absolute top-3 right-3">
                            <span className="text-[8px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-full uppercase">Recommended</span>
                          </div>
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Generic Alternative</p>
                          <p className="text-base font-black text-emerald-900">{generic!.medicine.brandName}</p>
                          <p className="text-[10px] text-emerald-700 mt-0.5">{generic!.medicine.manufacturer}</p>
                          <div className="mt-3 space-y-1.5">
                            <Row label="Unit price"   value={formatCurrency(generic!.bestPrice)}       green />
                            <Row label="Monthly cost" value={formatCurrency(generic!.monthlyCost)}     green highlight />
                            <Row label="Annual cost"  value={formatCurrency(generic!.monthlyCost * 12)} green />
                            <Row label="At pharmacy"  value={generic!.bestPharmacy}                   green />
                          </div>
                        </div>
                      </div>

                      {/* Safety + equivalence badge */}
                      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-emerald-800">Therapeutically Equivalent</p>
                          <p className="text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                            Both contain <strong>{medicine.saltComposition}</strong>. The generic has the same active ingredient, same strength, same dosage form — only the brand name and manufacturer differ. Switching is safe.
                          </p>
                        </div>
                      </div>

                      {/* BIG savings delta line */}
                      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-4 h-4 text-emerald-200" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Your Savings If You Switch</p>
                        </div>
                        <p className="text-xl font-black">
                          Switching saves{' '}
                          <span className="text-emerald-200">{formatCurrency(monthly)}/month</span>
                          {' '}={' '}
                          <span className="text-yellow-300">{formatCurrency(annual)}/year</span>
                        </p>
                        <p className="text-emerald-200 text-xs mt-1 font-semibold">{pct}% cheaper · same salt · same effect</p>
                      </div>

                      {/* Pharmacist script */}
                      <div className="rounded-xl bg-slate-900 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 text-blue-400" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pharmacist Script</p>
                          </div>
                          <button
                            onClick={() => handleCopy(script, medicine.id)}
                            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg transition-colors"
                          >
                            {copied === medicine.id
                              ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              : <Copy className="w-3 h-3 text-slate-400" />
                            }
                            <span className="text-[9px] font-bold text-slate-400">{copied === medicine.id ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-sm text-white font-medium italic leading-relaxed">"{script}"</p>
                          <p className="text-[9px] text-slate-500 mt-2">→ Say this at the pharmacy counter to request the generic</p>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* ── Medicines WITHOUT generics ──────────────────────────────────── */}
        {withoutGeneric.length > 0 && (
          <div className="px-6 py-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              No Generic Alternatives Found
            </p>
            <div className="space-y-2">
              {withoutGeneric.map(result => {
                const saltParts = parseSalt(result.medicine.saltComposition);
                return (
                  <div key={result.medicine.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700">{result.medicine.brandName}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{result.medicine.saltComposition}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 shrink-0">
                      {saltParts.slice(0, 2).map((p, i) => (
                        <span key={i} className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                          {p.strength || p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 font-medium">
                These medicines may be patented or niche formulations. Ask your doctor if a different brand with the same salt is acceptable.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer summary ───────────────────────────────────────────────────── */}
      {totalMonthlySaving > 0 && (
        <div className="border-t border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-bold text-emerald-800">
                Switch all {withGeneric.length} medicines to generics:
              </p>
            </div>
            <div className="text-right">
              <p className="text-base font-black text-emerald-700">
                Save {formatCurrency(totalMonthlySaving)}/month = <span className="text-lg">{formatCurrency(totalAnnualSaving)}</span>/year
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Tiny helper row component ─────────────────────────────────────────────────
function Row({ label, value, green, highlight }: {
  label: string; value: string; green?: boolean; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[9px] font-medium ${green ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-[10px] font-black ${highlight ? (green ? 'text-emerald-700' : 'text-slate-800') : (green ? 'text-emerald-600' : 'text-slate-600')}`}>
        {value}
      </span>
    </div>
  );
}
