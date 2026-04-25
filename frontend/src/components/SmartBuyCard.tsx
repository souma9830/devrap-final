import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, TrendingDown, Info, Copy, ShieldCheck, Store } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Medicine } from '../lib/api';

interface SmartBuyCardProps {
  medicine: Medicine;
  currentPrice: number;
  currentPharmacy: string;
  bestPrice: number;
  bestPharmacy: string;
  genericAlternative?: Medicine;
  savings: number;
  savingsPercent: number;
  confidence: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

export default function SmartBuyCard({ 
  medicine, currentPrice, currentPharmacy, bestPrice, bestPharmacy, 
  genericAlternative, savings, savingsPercent, confidence, reasoning 
}: SmartBuyCardProps) {
  
  const copyScript = () => {
    const script = `Do you have ${medicine.saltComposition} with same composition as ${medicine.brandName}?`;
    navigator.clipboard.writeText(script);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Smart Match Recommendation</span>
        </div>
        <span className="text-[10px] font-bold bg-white text-emerald-600 px-2 py-1 rounded border border-emerald-200 shadow-sm uppercase tracking-tighter">
          {confidence} CONFIDENCE 
        </span>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {medicine.brandName} <span className="text-sm font-normal text-slate-400 font-mono">(Current)</span>
            </h1>
            {genericAlternative && (
              <p className="text-emerald-600 font-bold text-lg mt-1">
                → Switch to {genericAlternative.brandName}
              </p>
            )}
            <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-md font-medium">
              {genericAlternative ? reasoning : "Bio-equivalent match found in local pharmacy network. Price optimization active."}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Pharmacy Best Price</div>
            <div className="text-3xl font-black text-emerald-600">{formatCurrency(bestPrice)}</div>
            <div className="text-xs text-red-500 line-through font-bold">{formatCurrency(currentPrice)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Salt Composition</span>
            <p className="text-sm font-semibold text-slate-700 mt-1">{medicine.saltComposition}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Best Availability</span>
            <div className="flex items-center space-x-2 mt-1">
              <Store className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">{bestPharmacy}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button 
            onClick={copyScript}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-lg shadow-slate-200"
          >
            <Copy className="w-4 h-4 text-emerald-500" />
            <span>Copy Pharmacist Script</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(' ');
}
