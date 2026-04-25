import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingDown, Copy, CheckCircle2, ChevronDown, ChevronUp,
  Sparkles, Calendar, DollarSign, ArrowRight, Pill,
  MessageSquare, Download, Star, AlertCircle
} from 'lucide-react';
import { AnalysisResult } from '../lib/api';
import { formatCurrency } from '../lib/utils';

interface SavingsPlanCardProps {
  results: AnalysisResult[];
}

interface CopiedState {
  [key: string]: boolean;
}

// Generate all 3 script variants per medicine
function getScripts(r: AnalysisResult) {
  const { medicine, generic } = r;
  return [
    {
      label: 'Generic Substitute Ask',
      script: `Do you have ${medicine.genericName} — same composition as ${medicine.brandName} (${medicine.saltComposition})?`,
      tip: 'Use this at any pharmacy counter'
    },
    {
      label: 'Jan Aushadhi Store Script',
      script: `I need ${medicine.saltComposition}. Do you have a Jan Aushadhi or government generic version available?`,
      tip: 'Use this at Jan Aushadhi / Pradhan Mantri Bhartiya Janaushadhi Kendra'
    },
    ...(generic ? [{
      label: 'Direct Generic Name Ask',
      script: `Can I get ${generic.medicine.brandName} by ${generic.medicine.manufacturer} instead of ${medicine.brandName}? Same salt — ${medicine.saltComposition}.`,
      tip: 'When you already know the generic brand name'
    }] : [])
  ];
}

export default function SavingsPlanCard({ results }: SavingsPlanCardProps) {
  const [expandedScripts, setExpandedScripts] = useState<string | null>(null);
  const [copied, setCopied] = useState<CopiedState>({});

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  // ── Aggregate calculations ────────────────────────────────────────────────
  const planRows = results.map(r => {
    const dosesPerDay = r.dosesPerDay || 1;

    // Option A: best pharmacy, same brand
    const brandMonthly = r.bestInfo.monthlyCost;
    const brandAnnual  = parseFloat((brandMonthly * 12).toFixed(2));

    // Option B: cheapest generic if available
    const genMonthly = r.generic ? r.generic.monthlyCost : brandMonthly;
    const genAnnual  = parseFloat((genMonthly * 12).toFixed(2));

    // Current (worst-case) for savings comparison
    const currentMonthly = r.currentInfo.monthlyCost;
    const currentAnnual  = parseFloat((currentMonthly * 12).toFixed(2));

    const monthlySaving = currentMonthly - genMonthly;
    const annualSaving  = parseFloat((monthlySaving * 12).toFixed(2));
    const savingsPct    = currentMonthly > 0 ? Math.round((monthlySaving / currentMonthly) * 100) : 0;

    return {
      result: r,
      dosesPerDay,
      brandMonthly, brandAnnual,
      genMonthly,   genAnnual,
      currentMonthly, currentAnnual,
      monthlySaving, annualSaving, savingsPct,
      recommendation: r.generic ? 'switch-generic' : 'best-pharmacy',
      scripts: getScripts(r)
    };
  });

  const totalAnnualSaving   = planRows.reduce((s, r) => s + r.annualSaving,  0);
  const totalMonthlyBest    = planRows.reduce((s, r) => s + r.genMonthly,    0);
  const totalMonthlyNow     = planRows.reduce((s, r) => s + r.currentMonthly,0);
  const totalAnnualBest     = parseFloat((totalMonthlyBest * 12).toFixed(2));
  const totalAnnualNow      = parseFloat((totalMonthlyNow  * 12).toFixed(2));
  const overallPct          = totalMonthlyNow > 0
    ? Math.round(((totalMonthlyNow - totalMonthlyBest) / totalMonthlyNow) * 100)
    : 0;

  const copyAllScripts = () => {
    const all = planRows.map(row => {
      const med = row.result.medicine;
      return `── ${med.brandName} ──\n${row.scripts.map(s => `[${s.label}]\n"${s.script}"`).join('\n')}`;
    }).join('\n\n');
    handleCopy(all, 'all');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Smart Buy Decision Plan
              </p>
            </div>
            <h2 className="text-xl font-black text-white">Your Optimised Savings Plan</h2>
            <p className="text-slate-400 text-xs mt-1">{results.length} medicines · Generic alternatives + best pharmacy prices</p>
          </div>

          {/* Annual savings hero number */}
          <div className="text-right shrink-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Annual savings</p>
            <p className="text-3xl font-black text-emerald-400">{formatCurrency(totalAnnualSaving)}</p>
            <p className="text-[10px] text-emerald-500 font-bold">{overallPct}% cost reduction</p>
          </div>
        </div>

        {/* Summary bar */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Current Annual', value: formatCurrency(totalAnnualNow), sub: 'what you pay now', strike: true },
            { label: 'Optimised Annual', value: formatCurrency(totalAnnualBest), sub: 'with smart buying', accent: true },
            { label: 'You Save / Year', value: formatCurrency(totalAnnualSaving), sub: `${overallPct}% reduction`, hero: true },
          ].map(({ label, value, sub, strike, accent, hero }) => (
            <div key={label} className={`rounded-xl p-3 ${hero ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10'}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest ${hero ? 'text-emerald-400' : 'text-slate-400'}`}>{label}</p>
              <p className={`text-base font-black mt-0.5 ${hero ? 'text-emerald-300' : accent ? 'text-white' : 'text-slate-400 line-through'}`}>{value}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Per-Medicine Decision Rows ──────────────────────────────────────── */}
      <div className="divide-y divide-slate-100">
        {planRows.map((row, i) => {
          const { result, scripts } = row;
          const { medicine, generic } = result;
          const scriptKey = medicine.id;
          const isOpen = expandedScripts === scriptKey;

          return (
            <div key={medicine.id}>
              {/* Decision row */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Pill className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-slate-900 text-sm">{medicine.brandName}</p>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{medicine.category}</span>
                      {row.savingsPct > 0 && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">
                          Save {row.savingsPct}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{medicine.saltComposition}</p>
                  </div>
                </div>

                {/* 2-column comparison: Brand Best vs Generic Best */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Brand Option */}
                  <div className={`rounded-xl p-3 border ${row.recommendation === 'best-pharmacy' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Best Brand Price</p>
                      {row.recommendation === 'best-pharmacy' && (
                        <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-black">✓ PICK</span>
                      )}
                    </div>
                    <p className="text-lg font-black text-slate-800">{formatCurrency(row.brandMonthly)}<span className="text-[10px] font-normal text-slate-400">/mo</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(row.brandAnnual)} / year</p>
                    <p className="text-[10px] text-blue-600 font-semibold mt-1">{result.bestInfo.pharmacy}</p>
                  </div>

                  {/* Generic Option */}
                  {generic ? (
                    <div className="rounded-xl p-3 border bg-emerald-50 border-emerald-200 relative">
                      <div className="flex items-center gap-1.5 mb-2">
                        <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Generic Alternative</p>
                        <span className="text-[8px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-black">✓ BEST</span>
                      </div>
                      <p className="text-lg font-black text-emerald-700">{formatCurrency(row.genMonthly)}<span className="text-[10px] font-normal text-emerald-500">/mo</span></p>
                      <p className="text-xs text-emerald-600 mt-0.5">{formatCurrency(row.genAnnual)} / year</p>
                      <p className="text-[10px] text-emerald-700 font-bold mt-1">{generic.medicine.brandName} · {generic.bestPharmacy}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl p-3 border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center gap-1">
                      <AlertCircle className="w-4 h-4 text-slate-300" />
                      <p className="text-[9px] text-slate-400 font-medium">No generic listed in DB</p>
                    </div>
                  )}
                </div>

                {/* Savings summary line */}
                {row.annualSaving > 0 && (
                  <div className="flex items-center gap-2 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Switch saves you{' '}
                      <span className="font-black">{formatCurrency(row.monthlySaving)}/month</span>
                      {' '}·{' '}
                      <span className="font-black">{formatCurrency(row.annualSaving)}/year</span>
                      {' '}({row.savingsPct}% cheaper)
                    </p>
                  </div>
                )}

                {/* Pharmacist Scripts toggle */}
                <button
                  onClick={() => setExpandedScripts(isOpen ? null : scriptKey)}
                  className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold">Pharmacist Scripts ({scripts.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[10px]">{isOpen ? 'Hide' : 'Show'}</span>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Script variants */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key={`scripts-${scriptKey}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-3">
                        {scripts.map((s, si) => {
                          const copyKey = `${scriptKey}-${si}`;
                          return (
                            <div key={si} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                  <Star className="w-2.5 h-2.5 text-amber-400" />
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                                </div>
                                <button
                                  onClick={() => handleCopy(s.script, copyKey)}
                                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg transition-colors"
                                >
                                  {copied[copyKey]
                                    ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    : <Copy className="w-3 h-3 text-slate-400" />
                                  }
                                  <span className="text-[9px] font-bold text-slate-400">
                                    {copied[copyKey] ? 'Copied!' : 'Copy'}
                                  </span>
                                </button>
                              </div>
                              <div className="px-3 py-3">
                                <p className="text-sm text-white font-medium leading-relaxed italic">
                                  "{s.script}"
                                </p>
                                <p className="text-[9px] text-slate-500 mt-2 flex items-center gap-1">
                                  <ArrowRight className="w-2.5 h-2.5" />
                                  {s.tip}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer: Copy All Scripts ─────────────────────────────────────────── */}
      <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-700">All Pharmacist Scripts</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Copy all scripts to show at the pharmacy counter</p>
        </div>
        <button
          onClick={copyAllScripts}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          {copied['all']
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            : <Copy className="w-4 h-4 text-blue-400" />
          }
          {copied['all'] ? 'Copied All!' : 'Copy All Scripts'}
        </button>
      </div>
    </motion.div>
  );
}
