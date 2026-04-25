import { useState } from 'react';
import Navbar from '../components/Navbar';
import PrescriptionEngine from '../components/PrescriptionEngine';
import Loader from '../components/Loader';
import PriceIntelligenceCard from '../components/PriceIntelligenceCard';
import MonthlyCostAnalyzer from '../components/MonthlyCostAnalyzer';
import PharmacyDashboard from '../components/PharmacyDashboard';
import GenericInsightsCard from '../components/GenericInsightsCard';
import SavingsPlanCard from '../components/SavingsPlanCard';
import SummaryCard from '../components/SummaryCard';
import SmartBuyDecision from '../components/SmartBuyDecision';
import { motion, AnimatePresence } from 'motion/react';
import { analyzePrescription, AnalysisResult, ParsedDrug } from '../lib/api';
import { Sparkles, ArrowLeft, AlertCircle, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function AnalyzePage() {
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState<AnalysisResult[] | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const handleAnalyze = async (drugs: ParsedDrug[]) => {
    setLoading(true); setResults(null); setError(null);
    try {
      const data = await analyzePrescription(drugs);
      setResults(data);
    } catch (e: any) {
      setError('Could not connect to RxRadar backend. Make sure the server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Totals
  const totalCurrent   = results?.reduce((acc, r) => acc + r.currentInfo.price,    0) || 0;
  const totalOptimized = results?.reduce((acc, r) => acc + (r.generic ? r.generic.bestPrice : r.bestInfo.price), 0) || 0;
  const totalSavings   = totalCurrent - totalOptimized;

  // Monthly totals
  const totalMonthlyNow  = results?.reduce((acc, r) => acc + r.currentInfo.monthlyCost,  0) || 0;
  const totalMonthlyBest = results?.reduce((acc, r) => acc + (r.generic ? r.generic.monthlyCost : r.bestInfo.monthlyCost), 0) || 0;
  const totalMonthlySave = totalMonthlyNow - totalMonthlyBest;

  // Worst variance across results
  const maxVariance = results ? Math.max(...results.map(r => r.priceVariance?.pct ?? 0)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <main className="max-w-[1024px] mx-auto px-6 pt-12">
        {!results && !loading ? (
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-3">
                Prescription Intelligence
              </h1>
              <p className="text-slate-500 font-medium">
                Upload a photo or type medicines — extract, normalize &amp; find the best price instantly.
              </p>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </motion.div>
            )}

            <PrescriptionEngine onAnalyze={handleAnalyze} isLoading={loading} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Topbar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setResults(null); setError(null); }}
                className="flex items-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                NEW PRESCRIPTION
              </button>
              <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Price Intelligence Active</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loader" exit={{ opacity: 0 }}>
                  <Loader message="Querying Pharmacy Network..." />
                </motion.div>
              ) : results && results.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-400 text-lg font-semibold">No medicines matched in database.</p>
                  <p className="text-slate-400 text-sm mt-2">Try brand names like "Lipitor", "Augmentin", or "Crocin".</p>
                </motion.div>
              ) : results && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-12 gap-6">
                  {/* ── Left Sidebar ── */}
                  <div className="col-span-12 lg:col-span-4 space-y-5">
                    <SummaryCard totalCurrent={totalCurrent} totalOptimized={totalOptimized} totalSavings={totalSavings} />

                    {/* Monthly Intelligence Panel */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                      className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-5 text-white"
                    >
                      <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-3">Monthly Cost Intelligence</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-indigo-200 font-medium">Current monthly spend</span>
                          <span className="line-through text-indigo-300 font-bold">{formatCurrency(totalMonthlyNow)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-indigo-200 font-medium">Optimized monthly</span>
                          <span className="text-emerald-400 font-black text-base">{formatCurrency(totalMonthlyBest)}</span>
                        </div>
                        <div className="h-px bg-indigo-700 my-1" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-black">You save monthly</span>
                          </div>
                          <span className="text-xl font-black text-emerald-300">{formatCurrency(totalMonthlySave)}</span>
                        </div>
                      </div>

                      {maxVariance > 0 && (
                        <div className={`mt-4 rounded-xl p-3 ${maxVariance >= 30 ? 'bg-red-500/20 border border-red-400/30' : 'bg-amber-500/20 border border-amber-400/30'}`}>
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">⚠ Price Gap Alert</p>
                          <p className="text-xs text-white/80 mt-0.5">
                            Up to <span className="font-black text-amber-300">{maxVariance}%</span> price variance across pharmacies in your prescription.
                          </p>
                        </div>
                      )}
                    </motion.div>

                    {/* Smart Buy Decision — sidebar */}
                    <SmartBuyDecision results={results} />

                    {/* Re-scan */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">New Scan</p>
                      <PrescriptionEngine onAnalyze={handleAnalyze} isLoading={loading} />
                    </div>
                  </div>

                  {/* ── Right: Results ── */}
                  <div className="col-span-12 lg:col-span-8 space-y-5">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Price Intelligence ({results.length} medicines)
                      </h2>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {results.filter(r => r.generic).length} generic alternatives found
                      </span>
                    </div>

                    {/* ── Monthly Cost Analyzer ── */}
                    <MonthlyCostAnalyzer results={results} />

                    {results.map((res, i) => (
                      <div key={res.medicine.id}>
                        <PriceIntelligenceCard result={res} index={i} />
                      </div>
                    ))}

                    {/* ── Pharmacy Comparison Dashboard ── */}
                    <PharmacyDashboard results={results} />

                    {/* ── Generic & Substitution Insights ── */}
                    <GenericInsightsCard results={results} />

                    {/* ── Savings Plan Generator ── */}
                    <SavingsPlanCard results={results} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
