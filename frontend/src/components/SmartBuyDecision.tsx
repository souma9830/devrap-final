import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, ArrowRight, Stethoscope, Copy, CheckCircle2,
  Star, TrendingDown, AlertTriangle, Info, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { AnalysisResult } from '../lib/api';
import { formatCurrency } from '../lib/utils';

interface SmartBuyDecisionProps {
  results: AnalysisResult[];
}

// ── Decision types ────────────────────────────────────────────────────────────
type DecisionType = 'exact' | 'generic' | 'consult';

interface Decision {
  rank:       number;
  type:       DecisionType;
  title:      string;
  subtitle:   string;
  confidence: number;        // 0–100
  rationale:  string;
  saving?:    string;        // e.g. "₹340/mo"
  script:     string;
  tag:        string;        // badge text
  isTop:      boolean;
}

// ── Confidence calculation ────────────────────────────────────────────────────
function calcConfidence(type: DecisionType, result: AnalysisResult): number {
  const { priceVariance, generic } = result;
  switch (type) {
    case 'exact': {
      // High confidence when price variance is low (means best pharmacy is reliably cheapest)
      const base = 88;
      const penalty = Math.min(priceVariance.pct * 0.4, 30); // variance hurts confidence
      return Math.round(Math.max(base - penalty, 55));
    }
    case 'generic': {
      if (!generic) return 0;
      // More savings = more confident the switch is worthwhile
      const base = 60 + generic.savingsPercent * 0.35;
      return Math.round(Math.min(base, 97));
    }
    case 'consult': {
      // Static moderate — always an option, never top-ranked
      return 52;
    }
  }
}

// ── Rank the decisions for one medicine ──────────────────────────────────────
function rankDecisions(result: AnalysisResult): Decision[] {
  const { medicine, generic, bestInfo, priceVariance } = result;
  const decisions: Decision[] = [];

  const exactConf   = calcConfidence('exact', result);
  const genericConf = generic ? calcConfidence('generic', result) : 0;

  // 1 — Buy exact drug at best pharmacy
  decisions.push({
    rank:       0, // will be set
    type:       'exact',
    title:      `Buy ${medicine.brandName} at ${bestInfo.pharmacy}`,
    subtitle:   `Best price for this brand`,
    confidence: exactConf,
    rationale:  priceVariance.pct > 0
      ? `${bestInfo.pharmacy} is ${priceVariance.pct}% cheaper than ${priceVariance.mostExpensive.pharmacy}. You pay ${formatCurrency(bestInfo.price)}/unit.`
      : `All pharmacies price this similarly at ${formatCurrency(bestInfo.price)}/unit.`,
    saving:     `${formatCurrency(bestInfo.monthlyCost)}/mo`,
    script:     `Do you have ${medicine.brandName} ${medicine.strength}? I need it at the best available price.`,
    tag:        priceVariance.pct > 20 ? 'Price Gap Alert' : 'Best Pharmacy',
    isTop:      false,
  });

  // 2 — Switch to generic (only if one exists)
  if (generic) {
    decisions.push({
      rank:       0,
      type:       'generic',
      title:      `Switch to ${generic.medicine.brandName}`,
      subtitle:   `Generic with identical salt composition`,
      confidence: genericConf,
      rationale:  `${generic.medicine.brandName} contains ${medicine.saltComposition} — exactly the same as ${medicine.brandName}. Therapeutically equivalent by CDSCO standards.`,
      saving:     `Save ${formatCurrency(generic.monthlySavings)}/mo = ${formatCurrency(generic.monthlySavings * 12)}/yr`,
      script:     `Do you have ${medicine.genericName} generic — same as ${medicine.brandName} (${medicine.saltComposition})? I'd like the ${generic.medicine.brandName} by ${generic.medicine.manufacturer}.`,
      tag:        generic.savingsPercent > 50 ? 'Top Saving' : 'Recommended',
      isTop:      false,
    });
  }

  // 3 — Consult doctor (always present)
  decisions.push({
    rank:       0,
    type:       'consult',
    title:      `Consult your doctor`,
    subtitle:   `For therapeutic substitution guidance`,
    confidence: 52,
    rationale:  generic
      ? `Before switching to a generic, confirm with your doctor — especially for narrow therapeutic index drugs like thyroid, anticoagulants, or epilepsy medicines.`
      : `No generic was found in our database. Your doctor may know of alternative formulations or substitute brands.`,
    script:     `Doctor, can I switch from ${medicine.brandName} to a generic with the same ${medicine.saltComposition}? I want to save on costs.`,
    tag:        'Always Safe',
    isTop:      false,
  });

  // ── Rank by confidence ────────────────────────────────────────────────────
  const sorted = decisions.sort((a, b) => b.confidence - a.confidence);
  sorted.forEach((d, i) => { d.rank = i + 1; d.isTop = i === 0; });
  return sorted;
}

// ── Colour palette per decision type ─────────────────────────────────────────
const TYPE_STYLES: Record<DecisionType, {
  icon: React.ReactNode;
  ring: string; bg: string; accent: string; badge: string;
}> = {
  exact: {
    icon:   <ShieldCheck className="w-5 h-5" />,
    ring:   'ring-blue-300',
    bg:     'bg-blue-50 border-blue-200',
    accent: 'text-blue-700',
    badge:  'bg-blue-600 text-white',
  },
  generic: {
    icon:   <TrendingDown className="w-5 h-5" />,
    ring:   'ring-emerald-300',
    bg:     'bg-emerald-50 border-emerald-200',
    accent: 'text-emerald-700',
    badge:  'bg-emerald-600 text-white',
  },
  consult: {
    icon:   <Stethoscope className="w-5 h-5" />,
    ring:   'ring-amber-300',
    bg:     'bg-amber-50 border-amber-200',
    accent: 'text-amber-700',
    badge:  'bg-amber-500 text-white',
  },
};

const RANK_LABEL = ['#1 Best Buy', '#2 Alternative', '#3 Fallback'];
const RANK_RING  = ['ring-2 ring-emerald-400 shadow-lg shadow-emerald-100', 'ring-1 ring-slate-200', 'ring-1 ring-slate-100 opacity-80'];

// ── Confidence bar ─────────────────────────────────────────────────────────
function ConfidenceBar({ score, accent }: { score: number; accent: string }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
      <span className={`text-xs font-black ${accent} min-w-[32px] text-right`}>{score}%</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SmartBuyDecision({ results }: SmartBuyDecisionProps) {
  const [activeId, setActiveId]   = useState<string>(results[0]?.medicine.id ?? '');
  const [copied,   setCopied]     = useState<string | null>(null);
  const [expanded, setExpanded]   = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeResult = results.find(r => r.medicine.id === activeId) ?? results[0];
  const decisions    = activeResult ? rankDecisions(activeResult) : [];
  const topDecision  = decisions[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-blue-900 px-6 py-6">
        <div className="flex flex-col gap-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-violet-300" />
              <p className="text-xs font-black text-violet-300 uppercase tracking-widest">Smart Buy Decision System</p>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">AI-Ranked Recommendations</h2>
            <p className="text-indigo-300 text-sm mt-1">Confidence-scored · Personalised to your prescription</p>
          </div>
          {topDecision && (
            <div className="mt-4 bg-white/10 rounded-xl p-4 border border-white/10">
              <p className="text-[10px] text-violet-300 font-black uppercase tracking-widest mb-1">Top Pick</p>
              <p className="text-base font-black text-white leading-tight">{topDecision.title}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 text-xs font-black">{topDecision.confidence}% confident</span>
              </div>
            </div>
          )}
        </div>

        {/* Medicine selector tabs */}
        {results.length > 1 && (
          <div className="mt-5 flex gap-2 flex-wrap">
            {results.map(r => (
              <button
                key={r.medicine.id}
                onClick={() => { setActiveId(r.medicine.id); setExpanded(null); }}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                  activeId === r.medicine.id
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
              >
                {r.medicine.brandName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Decision Cards ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="p-5 space-y-5"
        >
          {decisions.map((decision, idx) => {
            const style   = TYPE_STYLES[decision.type];
            const isOpen  = expanded === `${activeId}-${decision.type}`;
            const copyKey = `${activeId}-${decision.type}`;

            return (
              <motion.div
                key={decision.type}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`rounded-2xl border p-5 ${decision.isTop ? style.bg : 'bg-slate-50 border-slate-100'} ${RANK_RING[idx]}`}
              >
                {/* Row: rank + icon + title + confidence */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Rank badge */}
                      <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${style.badge}`}>
                          {RANK_LABEL[idx]}
                        </span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mt-1 ${
                          decision.isTop ? 'bg-white shadow-sm' : 'bg-slate-100'
                        } ${style.accent}`}>
                          {style.icon}
                        </div>
                      </div>

                      {/* Title block */}
                      <div className="min-w-0 flex-1 pt-1">
                        <p className={`text-base font-black ${decision.isTop ? 'text-slate-900' : 'text-slate-700'}`}>
                          {decision.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{decision.subtitle}</p>

                        {/* Saving delta */}
                        {decision.saving && (
                          <p className={`text-sm font-bold mt-2 ${style.accent}`}>
                            {decision.saving}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tag */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider ${
                        decision.isTop ? style.badge : 'bg-slate-200 text-slate-600'
                      }`}>
                        {decision.tag}
                      </span>
                    </div>
                  </div>
                  
                  {/* Confidence bar */}
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence Score</span>
                    </div>
                    <ConfidenceBar score={decision.confidence} accent={style.accent} />
                  </div>

                  <button
                    onClick={() => setExpanded(isOpen ? null : `${activeId}-${decision.type}`)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mt-2 w-full py-2 bg-white/50 border border-slate-200/50 rounded-lg transition-colors"
                  >
                    {isOpen ? 'Hide Details' : 'View Details'}
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded: rationale + script ──────────────────────────── */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key={`exp-${copyKey}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 space-y-4 pt-4 border-t border-black/5">
                        {/* Rationale */}
                        <div className="flex items-start gap-3 bg-white/60 p-4 rounded-xl border border-slate-200/50">
                          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">{decision.rationale}</p>
                        </div>

                        {/* One-click script */}
                        <div className="rounded-xl bg-slate-900 overflow-hidden shadow-lg">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-4 h-4 text-blue-400" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {decision.type === 'consult' ? 'Doctor Script' : 'Pharmacist Script'}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopy(decision.script, copyKey)}
                              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors active:scale-95"
                            >
                              {copied === copyKey
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                : <Copy className="w-4 h-4 text-slate-400" />
                              }
                              <span className="text-xs font-bold text-slate-300">
                                {copied === copyKey ? 'Copied!' : 'Copy Script'}
                              </span>
                            </button>
                          </div>
                          <p className="px-4 py-4 text-sm text-white font-medium italic leading-relaxed">
                            "{decision.script}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ── Footer: how confidence is calculated ─────────────────────────── */}
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            <strong className="text-slate-700 font-bold">Confidence scoring</strong> is based on price variance, generic savings %, therapeutic equivalence, and availability. Always consult your doctor before switching medications.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
